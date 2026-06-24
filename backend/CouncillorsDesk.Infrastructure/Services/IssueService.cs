using CouncillorsDesk.Core.DTOs.Issue;
using CouncillorsDesk.Core.Entities;
using CouncillorsDesk.Core.Enums;
using CouncillorsDesk.Core.Interfaces;
using CouncillorsDesk.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CouncillorsDesk.Infrastructure.Services;

/// <summary>
/// Manages issue reports including CRUD, search, status updates, and private visibility rules.
/// </summary>
public class IssueService : IIssueService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly INotificationService _notificationService;

    public IssueService(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        INotificationService notificationService)
    {
        _context = context;
        _userManager = userManager;
        _notificationService = notificationService;
    }

    public async Task<IssueDetailDto> CreateAsync(string reporterId, CreateIssueDto dto, CancellationToken cancellationToken = default)
    {
        var issue = new IssueReport
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            Category = dto.Category,
            Status = IssueStatus.Submitted,
            Location = dto.Location,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            ReporterId = reporterId,
            ReferenceNumber = await GenerateReferenceNumberAsync(cancellationToken),
            CreatedAt = DateTime.UtcNow,
            IsPrivate = dto.IsPrivate
        };

        _context.IssueReports.Add(issue);

        if (dto.PhotoUrls is { Count: > 0 })
        {
            foreach (var url in dto.PhotoUrls)
            {
                _context.IssuePhotos.Add(new IssuePhoto
                {
                    Id = Guid.NewGuid(),
                    IssueReportId = issue.Id,
                    Url = url,
                    UploadedAt = DateTime.UtcNow
                });
            }
        }

        _context.IssueUpdates.Add(new IssueUpdate
        {
            Id = Guid.NewGuid(),
            IssueReportId = issue.Id,
            UpdatedById = reporterId,
            PreviousStatus = null,
            NewStatus = IssueStatus.Submitted,
            Message = "Issue submitted successfully.",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);

        await NotifyStaffAsync(
            $"New issue: {issue.Title}",
            $"A resident reported \"{issue.Title}\" ({issue.ReferenceNumber}). Review it in the dashboard.",
            issue.Id,
            cancellationToken);

        return (await GetByIdAsync(issue.Id, reporterId, cancellationToken))!;
    }

    public async Task<IssueDetailDto?> GetByIdAsync(Guid id, string? currentUserId = null, CancellationToken cancellationToken = default)
    {
        var issue = await _context.IssueReports
            .AsNoTracking()
            .Include(i => i.Reporter)
            .Include(i => i.AssignedTo)
            .Include(i => i.Photos)
            .Include(i => i.Updates).ThenInclude(u => u.UpdatedBy)
            .Include(i => i.Comments).ThenInclude(c => c.User)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);

        if (issue is null)
        {
            return null;
        }

        if (!await CanViewIssueAsync(issue, currentUserId, cancellationToken))
        {
            return null;
        }

        return MapToDetailDto(issue);
    }

    public async Task<IReadOnlyList<IssueDto>> SearchAsync(IssueSearchDto search, CancellationToken cancellationToken = default)
    {
        var query = _context.IssueReports
            .AsNoTracking()
            .Include(i => i.Reporter)
            .Include(i => i.AssignedTo)
            .Include(i => i.Photos)
            .Include(i => i.Comments)
            .AsQueryable();

        // Public search excludes private issues unless filtering by reporter.
        if (string.IsNullOrWhiteSpace(search.ReporterId))
        {
            query = query.Where(i => !i.IsPrivate);
        }
        else
        {
            query = query.Where(i => !i.IsPrivate || i.ReporterId == search.ReporterId);
        }

        if (!string.IsNullOrWhiteSpace(search.Query))
        {
            var term = search.Query.Trim().ToLower();
            query = query.Where(i =>
                i.Title.ToLower().Contains(term)
                || i.Description.ToLower().Contains(term)
                || (i.ReferenceNumber != null && i.ReferenceNumber.ToLower().Contains(term))
                || i.Location.ToLower().Contains(term));
        }

        if (search.Category.HasValue)
        {
            query = query.Where(i => i.Category == search.Category.Value);
        }

        if (search.Status.HasValue)
        {
            query = query.Where(i => i.Status == search.Status.Value);
        }

        if (search.SolvedOnly == true)
        {
            query = query.Where(i => i.Status == IssueStatus.Resolved || i.Status == IssueStatus.Closed);
        }
        else if (search.SolvedOnly == false)
        {
            query = query.Where(i => i.Status != IssueStatus.Resolved && i.Status != IssueStatus.Closed);
        }

        if (!string.IsNullOrWhiteSpace(search.ReporterId))
        {
            query = query.Where(i => i.ReporterId == search.ReporterId);
        }

        if (!string.IsNullOrWhiteSpace(search.AssignedToId))
        {
            query = query.Where(i => i.AssignedToId == search.AssignedToId);
        }

        if (search.FromDate.HasValue)
        {
            query = query.Where(i => i.CreatedAt >= search.FromDate.Value);
        }

        if (search.ToDate.HasValue)
        {
            query = query.Where(i => i.CreatedAt <= search.ToDate.Value);
        }

        var page = Math.Max(1, search.Page);
        var pageSize = Math.Clamp(search.PageSize, 1, 100);

        var issues = await query
            .OrderByDescending(i => i.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return issues.Select(MapToDto).ToList();
    }

    public async Task<IssueDetailDto?> UpdateAsync(Guid id, string userId, UpdateIssueDto dto, CancellationToken cancellationToken = default)
    {
        var issue = await _context.IssueReports
            .Include(i => i.Reporter)
            .Include(i => i.AssignedTo)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);

        if (issue is null)
        {
            return null;
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            throw new UnauthorizedAccessException();
        }

        var isStaff = IsStaffRole(user.Role);
        var isReporter = issue.ReporterId == userId;

        if (!isStaff && !isReporter)
        {
            throw new UnauthorizedAccessException("You are not allowed to update this issue.");
        }

        if (!string.IsNullOrWhiteSpace(dto.Title))
        {
            issue.Title = dto.Title;
        }

        if (!string.IsNullOrWhiteSpace(dto.Description))
        {
            issue.Description = dto.Description;
        }

        if (dto.Category.HasValue)
        {
            issue.Category = dto.Category.Value;
        }

        if (!string.IsNullOrWhiteSpace(dto.Location))
        {
            issue.Location = dto.Location;
        }

        if (dto.Latitude.HasValue)
        {
            issue.Latitude = dto.Latitude;
        }

        if (dto.Longitude.HasValue)
        {
            issue.Longitude = dto.Longitude;
        }

        if (dto.AssignedToId is not null && isStaff)
        {
            issue.AssignedToId = string.IsNullOrWhiteSpace(dto.AssignedToId) ? null : dto.AssignedToId;
        }

        if (dto.Status.HasValue && isStaff)
        {
            var previousStatus = issue.Status;
            issue.Status = dto.Status.Value;
            issue.UpdatedAt = DateTime.UtcNow;

            if (dto.Status.Value is IssueStatus.Resolved or IssueStatus.Closed)
            {
                issue.ResolvedAt = DateTime.UtcNow;
                issue.CommentsClosed = true;
            }

            _context.IssueUpdates.Add(new IssueUpdate
            {
                Id = Guid.NewGuid(),
                IssueReportId = issue.Id,
                UpdatedById = userId,
                PreviousStatus = previousStatus,
                NewStatus = dto.Status.Value,
                Message = $"Status changed to {dto.Status.Value}.",
                CreatedAt = DateTime.UtcNow
            });

            await _notificationService.SendAsync(
                issue.ReporterId,
                NotificationType.StatusUpdate,
                "Issue status updated",
                $"Your issue \"{issue.Title}\" is now {dto.Status.Value}.",
                issue.Id,
                $"/issues/{issue.Id}",
                cancellationToken);
        }
        else
        {
            issue.UpdatedAt = DateTime.UtcNow;

            if (isReporter && !isStaff)
            {
                await NotifyStaffAsync(
                    $"Issue updated: {issue.Title}",
                    $"The reporter updated \"{issue.Title}\". Please review the latest details.",
                    issue.Id,
                    cancellationToken);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(id, userId, cancellationToken);
    }

    public async Task<IssueDetailDto?> GetByReferenceAsync(
        string referenceNumber,
        string? currentUserId = null,
        CancellationToken cancellationToken = default)
    {
        var normalized = referenceNumber.Trim().ToUpperInvariant();
        var issueId = await _context.IssueReports
            .AsNoTracking()
            .Where(i => i.ReferenceNumber != null && i.ReferenceNumber.ToUpper() == normalized)
            .Select(i => i.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (issueId == Guid.Empty)
        {
            return null;
        }

        return await GetByIdAsync(issueId, currentUserId, cancellationToken);
    }

    public async Task<IssueCommentDto> AddReplyAsync(
        Guid issueId,
        Guid parentCommentId,
        string userId,
        string content,
        CancellationToken cancellationToken = default)
    {
        var parent = await _context.IssueComments
            .Include(c => c.IssueReport)
            .FirstOrDefaultAsync(c => c.Id == parentCommentId && c.IssueReportId == issueId, cancellationToken)
            ?? throw new KeyNotFoundException("Parent comment not found.");

        var issue = parent.IssueReport;

        if (!await CanViewIssueAsync(issue, userId, cancellationToken))
        {
            throw new UnauthorizedAccessException("You are not allowed to comment on this issue.");
        }

        if (issue.Status is IssueStatus.Resolved or IssueStatus.Closed)
        {
            throw new UnauthorizedAccessException("This issue is resolved. You can read past comments but cannot add new ones.");
        }

        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        var isStaff = IsStaffRole(user.Role);
        if (issue.CommentsClosed && !isStaff)
        {
            throw new UnauthorizedAccessException("Comments are closed on this issue.");
        }

        var reply = new IssueComment
        {
            Id = Guid.NewGuid(),
            IssueReportId = issueId,
            UserId = userId,
            ParentCommentId = parent.Id,
            Content = content,
            IsOfficialResponse = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.IssueComments.Add(reply);
        issue.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        await NotifyCommentActivityAsync(issue, user, isStaff, isOfficialResponse: false, cancellationToken);

        return MapCommentDto(reply, user);
    }

    public async Task<IssueCommentDto> AddCommentAsync(
        Guid issueId,
        string userId,
        string content,
        bool isOfficialResponse = false,
        CancellationToken cancellationToken = default)
    {
        var issue = await _context.IssueReports.FindAsync([issueId], cancellationToken)
            ?? throw new KeyNotFoundException("Issue not found.");

        if (!await CanViewIssueAsync(issue, userId, cancellationToken))
        {
            throw new UnauthorizedAccessException("You are not allowed to comment on this issue.");
        }

        if (issue.Status is IssueStatus.Resolved or IssueStatus.Closed)
        {
            throw new UnauthorizedAccessException("This issue is resolved. You can read past comments but cannot add new ones.");
        }

        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        var isStaff = IsStaffRole(user.Role);
        if (issue.CommentsClosed && !isStaff)
        {
            throw new UnauthorizedAccessException("Comments are closed on this issue. The councillor has locked this discussion.");
        }

        if (isOfficialResponse && !isStaff)
        {
            throw new UnauthorizedAccessException("Only staff can post official responses.");
        }

        var comment = new IssueComment
        {
            Id = Guid.NewGuid(),
            IssueReportId = issueId,
            UserId = userId,
            Content = content,
            IsOfficialResponse = isOfficialResponse,
            CreatedAt = DateTime.UtcNow
        };

        _context.IssueComments.Add(comment);
        issue.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        await NotifyCommentActivityAsync(issue, user, isStaff, isOfficialResponse, cancellationToken);

        return MapCommentDto(comment, user);
    }

    private async Task NotifyCommentActivityAsync(
        IssueReport issue,
        ApplicationUser user,
        bool isStaff,
        bool isOfficialResponse,
        CancellationToken cancellationToken)
    {
        if (isStaff && issue.ReporterId != user.Id)
        {
            await _notificationService.SendAsync(
                issue.ReporterId,
                isOfficialResponse ? NotificationType.CouncillorResponse : NotificationType.NewComment,
                isOfficialResponse ? "Official response on your issue" : "New comment on your issue",
                $"{GetDisplayName(user)} commented on \"{issue.Title}\".",
                issue.Id,
                $"/issues/{issue.Id}",
                cancellationToken);
        }
        else if (!isStaff)
        {
            await NotifyStaffAsync(
                $"New comment: {issue.Title}",
                $"{GetDisplayName(user)} commented on issue \"{issue.Title}\".",
                issue.Id,
                cancellationToken);
        }
    }

    public async Task<IssueUpdateDto> AddStatusUpdateAsync(
        Guid issueId,
        string userId,
        IssueStatus newStatus,
        string message,
        CancellationToken cancellationToken = default)
    {
        var issue = await _context.IssueReports.FindAsync([issueId], cancellationToken)
            ?? throw new KeyNotFoundException("Issue not found.");

        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        if (!IsStaffRole(user.Role))
        {
            throw new UnauthorizedAccessException("Only staff can add status updates.");
        }

        var previousStatus = issue.Status;
        issue.Status = newStatus;
        issue.UpdatedAt = DateTime.UtcNow;

        if (newStatus is IssueStatus.Resolved or IssueStatus.Closed)
        {
            issue.ResolvedAt = DateTime.UtcNow;
            issue.CommentsClosed = true;
        }

        var update = new IssueUpdate
        {
            Id = Guid.NewGuid(),
            IssueReportId = issueId,
            UpdatedById = userId,
            PreviousStatus = previousStatus,
            NewStatus = newStatus,
            Message = message,
            CreatedAt = DateTime.UtcNow
        };

        _context.IssueUpdates.Add(update);
        await _context.SaveChangesAsync(cancellationToken);

        await _notificationService.SendAsync(
            issue.ReporterId,
            NotificationType.StatusUpdate,
            "Issue status updated",
            $"Your issue \"{issue.Title}\" is now {newStatus}. {message}",
            issueId,
            $"/issues/{issueId}",
            cancellationToken);

        return new IssueUpdateDto
        {
            Id = update.Id,
            PreviousStatus = update.PreviousStatus,
            NewStatus = update.NewStatus,
            Message = update.Message,
            UpdatedByName = GetDisplayName(user),
            CreatedAt = update.CreatedAt
        };
    }

    public async Task<bool> DeleteAsync(Guid id, string userId, CancellationToken cancellationToken = default)
    {
        var issue = await _context.IssueReports.FindAsync([id], cancellationToken);
        if (issue is null)
        {
            return false;
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return false;
        }

        var isStaff = IsStaffRole(user.Role);

        if (isStaff)
        {
            // Councillors may delete any issue at any time.
        }
        else if (issue.ReporterId != userId)
        {
            throw new UnauthorizedAccessException("You are not allowed to delete this issue.");
        }
        else
        {
            var age = DateTime.UtcNow - issue.CreatedAt;
            if (age.TotalDays > 5)
            {
                throw new UnauthorizedAccessException(
                    "You can only delete your issue within 5 days of reporting. Contact the councillor for removal.");
            }
        }

        _context.IssueReports.Remove(issue);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> SetCommentsClosedAsync(
        Guid id,
        string userId,
        bool closed,
        CancellationToken cancellationToken = default)
    {
        var issue = await _context.IssueReports.FindAsync([id], cancellationToken);
        if (issue is null)
        {
            return false;
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null || !IsStaffRole(user.Role))
        {
            throw new UnauthorizedAccessException("Only councillors can open or close comments on an issue.");
        }

        issue.CommentsClosed = closed;
        issue.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        await _notificationService.SendAsync(
            issue.ReporterId,
            NotificationType.StatusUpdate,
            closed ? "Comments closed on your issue" : "Comments reopened on your issue",
            closed
                ? $"Comments on \"{issue.Title}\" have been closed by the councillor."
                : $"You can comment again on \"{issue.Title}\".",
            issue.Id,
            $"/issues/{issue.Id}",
            cancellationToken);

        return true;
    }

    private async Task NotifyStaffAsync(
        string title,
        string message,
        Guid issueId,
        CancellationToken cancellationToken)
    {
        var staffIds = await _userManager.Users
            .Where(u => u.Role == UserRole.Councillor || u.Role == UserRole.Admin || u.Role == UserRole.Staff)
            .Select(u => u.Id)
            .ToListAsync(cancellationToken);

        foreach (var staffId in staffIds)
        {
            await _notificationService.SendAsync(
                staffId,
                NotificationType.IssueAssigned,
                title,
                message,
                issueId,
                $"/dashboard/issues",
                cancellationToken);
        }
    }

    private static string GetDisplayName(ApplicationUser user) =>
        string.IsNullOrWhiteSpace(user.DisplayName) ? user.FullName : user.DisplayName;

    /// <summary>
    /// Generates a unique tracking number in the format A18-YYYYMMDD-XXXX.
    /// </summary>
    private async Task<string> GenerateReferenceNumberAsync(CancellationToken cancellationToken)
    {
        var datePart = DateTime.UtcNow.ToString("yyyyMMdd");
        var prefix = $"A18-{datePart}-";

        var todayCount = await _context.IssueReports
            .CountAsync(i => i.ReferenceNumber != null && i.ReferenceNumber.StartsWith(prefix), cancellationToken);

        for (var attempt = 0; attempt < 100; attempt++)
        {
            var sequence = (todayCount + attempt + 1).ToString("D4");
            var reference = prefix + sequence;

            var exists = await _context.IssueReports
                .AnyAsync(i => i.ReferenceNumber == reference, cancellationToken);

            if (!exists)
            {
                return reference;
            }
        }

        throw new InvalidOperationException("Unable to generate a unique reference number.");
    }

    /// <summary>
    /// Private issues are visible only to the reporter, assignee, and staff roles.
    /// </summary>
    private async Task<bool> CanViewIssueAsync(IssueReport issue, string? currentUserId, CancellationToken cancellationToken)
    {
        if (!issue.IsPrivate)
        {
            return true;
        }

        if (string.IsNullOrWhiteSpace(currentUserId))
        {
            return false;
        }

        if (issue.ReporterId == currentUserId || issue.AssignedToId == currentUserId)
        {
            return true;
        }

        var user = await _userManager.FindByIdAsync(currentUserId);
        return user is not null && IsStaffRole(user.Role);
    }

    private static bool IsStaffRole(string role) =>
        role is UserRole.Admin or UserRole.Councillor or UserRole.Staff;

    private static IssueDto MapToDto(IssueReport issue) => new()
    {
        Id = issue.Id,
        Title = issue.Title,
        Description = issue.Description,
        Category = issue.Category,
        Status = issue.Status,
        Location = issue.Location,
        Latitude = issue.Latitude,
        Longitude = issue.Longitude,
        ReferenceNumber = issue.ReferenceNumber,
        ReporterName = GetDisplayName(issue.Reporter),
        AssignedToName = issue.AssignedTo is not null ? GetDisplayName(issue.AssignedTo) : null,
        CreatedAt = issue.CreatedAt,
        UpdatedAt = issue.UpdatedAt,
        ResolvedAt = issue.ResolvedAt,
        PhotoCount = issue.Photos.Count,
        CoverPhotoUrl = issue.Photos.OrderBy(p => p.UploadedAt).Select(p => p.Url).FirstOrDefault(),
        CommentCount = issue.Comments.Count,
        CommentsClosed = issue.CommentsClosed
    };

    private static IssueDetailDto MapToDetailDto(IssueReport issue) => new()
    {
        Id = issue.Id,
        Title = issue.Title,
        Description = issue.Description,
        Category = issue.Category,
        Status = issue.Status,
        Location = issue.Location,
        Latitude = issue.Latitude,
        Longitude = issue.Longitude,
        ReferenceNumber = issue.ReferenceNumber,
        ReporterId = issue.ReporterId,
        ReporterName = GetDisplayName(issue.Reporter),
        AssignedToId = issue.AssignedToId,
        AssignedToName = issue.AssignedTo is not null ? GetDisplayName(issue.AssignedTo) : null,
        CreatedAt = issue.CreatedAt,
        UpdatedAt = issue.UpdatedAt,
        ResolvedAt = issue.ResolvedAt,
        PhotoCount = issue.Photos.Count,
        CommentCount = issue.Comments.Count,
        CommentsClosed = issue.CommentsClosed,
        PhotoUrls = issue.Photos.Select(p => p.Url).ToList(),
        Updates = issue.Updates
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new IssueUpdateDto
            {
                Id = u.Id,
                PreviousStatus = u.PreviousStatus,
                NewStatus = u.NewStatus,
                Message = u.Message,
                UpdatedByName = GetDisplayName(u.UpdatedBy),
                CreatedAt = u.CreatedAt
            })
            .ToList(),
        Comments = BuildCommentTree(issue.Comments)
    };

    private static IReadOnlyList<IssueCommentDto> BuildCommentTree(ICollection<IssueComment> comments)
    {
        var all = comments.ToList();
        return all
            .Where(c => c.ParentCommentId is null)
            .OrderBy(c => c.CreatedAt)
            .Select(c => MapCommentDto(c, all))
            .ToList();
    }

    private static IssueCommentDto MapCommentDto(IssueComment comment, ICollection<IssueComment> allComments)
    {
        var user = comment.User;
        return new IssueCommentDto
        {
            Id = comment.Id,
            UserId = comment.UserId,
            UserName = GetDisplayName(user),
            UserCommentNote = user.CommentNote,
            UserPhotoUrl = user.ProfilePhotoUrl,
            ParentCommentId = comment.ParentCommentId,
            Content = comment.Content,
            IsOfficialResponse = comment.IsOfficialResponse,
            CreatedAt = comment.CreatedAt,
            Replies = allComments
                .Where(r => r.ParentCommentId == comment.Id)
                .OrderBy(r => r.CreatedAt)
                .Select(r => MapCommentDto(r, allComments))
                .ToList()
        };
    }

    private static IssueCommentDto MapCommentDto(IssueComment comment, ApplicationUser user) =>
        new()
        {
            Id = comment.Id,
            UserId = user.Id,
            UserName = GetDisplayName(user),
            UserCommentNote = user.CommentNote,
            UserPhotoUrl = user.ProfilePhotoUrl,
            ParentCommentId = comment.ParentCommentId,
            Content = comment.Content,
            IsOfficialResponse = comment.IsOfficialResponse,
            CreatedAt = comment.CreatedAt,
            Replies = []
        };
}
