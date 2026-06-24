using CouncillorsDesk.Api.Models;
using CouncillorsDesk.Core.Enums;
using CouncillorsDesk.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CouncillorsDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = $"{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<CouncillorDashboardDto>> GetStats(CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var openStatuses = new IssueStatus[]
        {
            IssueStatus.Submitted,
            IssueStatus.UnderReview,
            IssueStatus.Assigned,
            IssueStatus.InProgress
        };

        var resolvedStatuses = new IssueStatus[]
        {
            IssueStatus.Resolved,
            IssueStatus.Closed
        };

        var totalIssues = await _context.IssueReports.CountAsync(cancellationToken);
        var openIssues = await _context.IssueReports
            .CountAsync(i => openStatuses.Contains(i.Status), cancellationToken);
        var resolvedIssues = await _context.IssueReports
            .CountAsync(i => resolvedStatuses.Contains(i.Status), cancellationToken);

        var privateIssues = await _context.IssueReports
            .CountAsync(i => i.IsPrivate, cancellationToken);

        var pendingReports = await _context.ContentReports
            .CountAsync(r => r.Status == ContentReportStatus.Pending, cancellationToken);

        var activeAnnouncements = await _context.Announcements
            .CountAsync(a => a.IsActive && a.EffectiveFrom <= now && (a.EffectiveTo == null || a.EffectiveTo >= now),
                cancellationToken);

        var totalResidents = await _context.Users
            .CountAsync(u => u.Role == UserRole.Resident, cancellationToken);

        var communityPosts = await _context.CommunityPosts.CountAsync(cancellationToken);

        var unassignedIssues = await _context.IssueReports
            .CountAsync(i => i.AssignedToId == null && openStatuses.Contains(i.Status), cancellationToken);

        var recentIssues = await _context.IssueReports
            .AsNoTracking()
            .OrderByDescending(i => i.CreatedAt)
            .Take(10)
            .Select(i => new RecentIssueSummaryDto
            {
                Id = i.Id,
                Title = i.Title,
                Status = i.Status,
                Category = i.Category,
                ReferenceNumber = i.ReferenceNumber,
                CreatedAt = i.CreatedAt,
                ResolvedAt = i.ResolvedAt
            })
            .ToListAsync(cancellationToken);

        var needsAttentionIssues = await _context.IssueReports
            .AsNoTracking()
            .Where(i => openStatuses.Contains(i.Status))
            .OrderByDescending(i => i.CreatedAt)
            .Take(6)
            .Select(i => new RecentIssueSummaryDto
            {
                Id = i.Id,
                Title = i.Title,
                Status = i.Status,
                Category = i.Category,
                ReferenceNumber = i.ReferenceNumber,
                CreatedAt = i.CreatedAt,
                ResolvedAt = i.ResolvedAt
            })
            .ToListAsync(cancellationToken);

        var recentlyResolvedIssues = await _context.IssueReports
            .AsNoTracking()
            .Where(i => resolvedStatuses.Contains(i.Status))
            .OrderByDescending(i => i.ResolvedAt ?? i.UpdatedAt ?? i.CreatedAt)
            .Take(6)
            .Select(i => new RecentIssueSummaryDto
            {
                Id = i.Id,
                Title = i.Title,
                Status = i.Status,
                Category = i.Category,
                ReferenceNumber = i.ReferenceNumber,
                CreatedAt = i.CreatedAt,
                ResolvedAt = i.ResolvedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(new CouncillorDashboardDto
        {
            TotalIssues = totalIssues,
            OpenIssues = openIssues,
            ResolvedIssues = resolvedIssues,
            PrivateIssues = privateIssues,
            PendingReports = pendingReports,
            ActiveAnnouncements = activeAnnouncements,
            TotalResidents = totalResidents,
            CommunityPosts = communityPosts,
            UnassignedIssues = unassignedIssues,
            RecentIssues = recentIssues,
            NeedsAttentionIssues = needsAttentionIssues,
            RecentlyResolvedIssues = recentlyResolvedIssues
        });
    }
}
