using CouncillorsDesk.Core.DTOs;
using CouncillorsDesk.Core.Entities;
using CouncillorsDesk.Core.Enums;
using CouncillorsDesk.Core.Interfaces;
using CouncillorsDesk.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CouncillorsDesk.Infrastructure.Services;

/// <summary>
/// Manages official ward announcements displayed on the portal and feed.
/// </summary>
public class AnnouncementService : IAnnouncementService
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notificationService;

    public AnnouncementService(ApplicationDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<AnnouncementDto> CreateAsync(
        string authorId,
        AnnouncementDto dto,
        CancellationToken cancellationToken = default)
    {
        var announcement = new Announcement
        {
            Id = Guid.NewGuid(),
            AuthorId = authorId,
            Title = dto.Title,
            Content = dto.Content,
            Category = dto.Category,
            IsActive = dto.IsActive,
            EffectiveFrom = dto.EffectiveFrom == default ? DateTime.UtcNow : dto.EffectiveFrom,
            EffectiveTo = dto.EffectiveTo,
            CreatedAt = DateTime.UtcNow
        };

        _context.Announcements.Add(announcement);
        await _context.SaveChangesAsync(cancellationToken);

        // Notify all residents about new active announcements.
        if (announcement.IsActive)
        {
            var residents = await _context.Users
                .AsNoTracking()
                .Where(u => u.Role == UserRole.Resident)
                .Select(u => u.Id)
                .ToListAsync(cancellationToken);

            foreach (var residentId in residents)
            {
                await _notificationService.SendAsync(
                    residentId,
                    NotificationType.Announcement,
                    announcement.Title,
                    announcement.Content.Length > 120
                        ? announcement.Content[..120] + "..."
                        : announcement.Content,
                    announcement.Id,
                    $"/announcements/{announcement.Id}",
                    cancellationToken);
            }
        }

        return (await GetByIdAsync(announcement.Id, cancellationToken))!;
    }

    public async Task<AnnouncementDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var announcement = await _context.Announcements
            .AsNoTracking()
            .Include(a => a.Author)
            .Include(a => a.Comments).ThenInclude(c => c.User)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        return announcement is null ? null : MapToDto(announcement);
    }

    public async Task<AnnouncementCommentDto> AddCommentAsync(
        Guid announcementId,
        string userId,
        string content,
        CancellationToken cancellationToken = default)
    {
        var announcement = await _context.Announcements.FindAsync([announcementId], cancellationToken)
            ?? throw new KeyNotFoundException("Announcement not found.");

        var user = await _context.Users.FindAsync([userId], cancellationToken)
            ?? throw new KeyNotFoundException("User not found.");

        var comment = new AnnouncementComment
        {
            Id = Guid.NewGuid(),
            AnnouncementId = announcementId,
            UserId = userId,
            Content = content,
            CreatedAt = DateTime.UtcNow
        };

        _context.AnnouncementComments.Add(comment);
        await _context.SaveChangesAsync(cancellationToken);

        return MapCommentDto(comment, user);
    }

    public async Task<AnnouncementCommentDto> AddReplyAsync(
        Guid announcementId,
        Guid parentCommentId,
        string userId,
        string content,
        CancellationToken cancellationToken = default)
    {
        var parent = await _context.AnnouncementComments
            .FirstOrDefaultAsync(c => c.Id == parentCommentId && c.AnnouncementId == announcementId, cancellationToken)
            ?? throw new KeyNotFoundException("Parent comment not found.");

        var user = await _context.Users.FindAsync([userId], cancellationToken)
            ?? throw new KeyNotFoundException("User not found.");

        var reply = new AnnouncementComment
        {
            Id = Guid.NewGuid(),
            AnnouncementId = announcementId,
            UserId = userId,
            ParentCommentId = parent.Id,
            Content = content,
            CreatedAt = DateTime.UtcNow
        };

        _context.AnnouncementComments.Add(reply);
        await _context.SaveChangesAsync(cancellationToken);

        return MapCommentDto(reply, user);
    }

    public async Task<IReadOnlyList<AnnouncementDto>> GetActiveAsync(
        FeedCategory? category = null,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var query = _context.Announcements
            .AsNoTracking()
            .Include(a => a.Author)
            .Where(a => a.IsActive && a.EffectiveFrom <= now && (a.EffectiveTo == null || a.EffectiveTo >= now));

        if (category.HasValue)
        {
            query = query.Where(a => a.Category == category.Value);
        }

        var announcements = await query
            .OrderByDescending(a => a.EffectiveFrom)
            .ToListAsync(cancellationToken);

        return announcements.Select(MapToDto).ToList();
    }

    public async Task<AnnouncementDto?> UpdateAsync(
        Guid id,
        string authorId,
        AnnouncementDto dto,
        CancellationToken cancellationToken = default)
    {
        var announcement = await _context.Announcements
            .Include(a => a.Author)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        if (announcement is null)
        {
            return null;
        }

        await EnsureCanModifyAsync(announcement, authorId, cancellationToken);

        announcement.Title = dto.Title;
        announcement.Content = dto.Content;
        announcement.Category = dto.Category;
        announcement.IsActive = dto.IsActive;
        announcement.EffectiveFrom = dto.EffectiveFrom;
        announcement.EffectiveTo = dto.EffectiveTo;
        announcement.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return MapToDto(announcement);
    }

    public async Task<bool> DeactivateAsync(Guid id, string authorId, CancellationToken cancellationToken = default)
    {
        var announcement = await _context.Announcements.FindAsync([id], cancellationToken);
        if (announcement is null)
        {
            return false;
        }

        await EnsureCanModifyAsync(announcement, authorId, cancellationToken);

        announcement.IsActive = false;
        announcement.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task EnsureCanModifyAsync(Announcement announcement, string authorId, CancellationToken cancellationToken)
    {
        if (announcement.AuthorId == authorId)
        {
            return;
        }

        var user = await _context.Users.FindAsync([authorId], cancellationToken)
            ?? throw new UnauthorizedAccessException();

        if (user.Role is not (UserRole.Admin or UserRole.Councillor or UserRole.Staff))
        {
            throw new UnauthorizedAccessException("You are not allowed to modify this announcement.");
        }
    }

    private static AnnouncementDto MapToDto(Announcement announcement) => new()
    {
        Id = announcement.Id,
        Title = announcement.Title,
        Content = announcement.Content,
        Category = announcement.Category,
        IsActive = announcement.IsActive,
        AuthorId = announcement.AuthorId,
        AuthorName = announcement.Author.FullName,
        EffectiveFrom = announcement.EffectiveFrom,
        EffectiveTo = announcement.EffectiveTo,
        CreatedAt = announcement.CreatedAt,
        Comments = BuildCommentTree(announcement.Comments)
    };

    private static IReadOnlyList<AnnouncementCommentDto> BuildCommentTree(ICollection<AnnouncementComment> comments)
    {
        var all = comments.ToList();
        return all
            .Where(c => c.ParentCommentId is null)
            .OrderBy(c => c.CreatedAt)
            .Select(c => MapCommentDto(c, all))
            .ToList();
    }

    private static AnnouncementCommentDto MapCommentDto(AnnouncementComment comment, ICollection<AnnouncementComment> all)
    {
        var user = comment.User;
        return new AnnouncementCommentDto
        {
            Id = comment.Id,
            UserId = comment.UserId,
            UserName = string.IsNullOrWhiteSpace(user.DisplayName) ? user.FullName : user.DisplayName,
            UserCommentNote = user.CommentNote,
            ParentCommentId = comment.ParentCommentId,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            Replies = all
                .Where(r => r.ParentCommentId == comment.Id)
                .OrderBy(r => r.CreatedAt)
                .Select(r => MapCommentDto(r, all))
                .ToList()
        };
    }

    private static AnnouncementCommentDto MapCommentDto(AnnouncementComment comment, ApplicationUser user) =>
        new()
        {
            Id = comment.Id,
            UserId = user.Id,
            UserName = string.IsNullOrWhiteSpace(user.DisplayName) ? user.FullName : user.DisplayName,
            UserCommentNote = user.CommentNote,
            ParentCommentId = comment.ParentCommentId,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            Replies = []
        };
}
