using CouncillorsDesk.Core.DTOs.Dashboard;
using CouncillorsDesk.Core.Enums;
using CouncillorsDesk.Core.Interfaces;
using CouncillorsDesk.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CouncillorsDesk.Infrastructure.Services;

/// <summary>
/// Aggregates public transparency statistics for the ward dashboard.
/// Private issues are excluded from published stats.
/// </summary>
public class TransparencyService : ITransparencyService
{
    private readonly ApplicationDbContext _context;

    public TransparencyService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TransparencyStatsDto> GetStatsAsync(
        DateTime? fromDate = null,
        DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.IssueReports
            .AsNoTracking()
            .Where(i => !i.IsPrivate);

        if (fromDate.HasValue)
        {
            query = query.Where(i => i.CreatedAt >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(i => i.CreatedAt <= toDate.Value);
        }

        var issues = await query.ToListAsync(cancellationToken);

        var total = issues.Count;
        var resolved = issues.Count(i => i.Status is IssueStatus.Resolved or IssueStatus.Closed);
        var open = total - resolved;

        var resolvedWithDates = issues
            .Where(i => i.ResolvedAt.HasValue)
            .Select(i => (i.ResolvedAt!.Value - i.CreatedAt).TotalDays)
            .ToList();

        var averageResolutionDays = resolvedWithDates.Count > 0
            ? resolvedWithDates.Average()
            : 0;

        var issuesByCategory = issues
            .GroupBy(i => i.Category)
            .ToDictionary(g => g.Key, g => g.Count());

        var issuesByStatus = issues
            .GroupBy(i => i.Status)
            .ToDictionary(g => g.Key, g => g.Count());

        var monthlyTrend = issues
            .GroupBy(i => new { i.CreatedAt.Year, i.CreatedAt.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new MonthlyIssueStatsDto
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Submitted = g.Count(),
                Resolved = g.Count(i => i.Status is IssueStatus.Resolved or IssueStatus.Closed)
            })
            .ToList();

        return new TransparencyStatsDto
        {
            TotalIssues = total,
            ResolvedIssues = resolved,
            OpenIssues = open,
            ResolutionRate = total > 0 ? Math.Round(resolved * 100.0 / total, 1) : 0,
            AverageResolutionDays = Math.Round(averageResolutionDays, 1),
            IssuesByCategory = issuesByCategory,
            IssuesByStatus = issuesByStatus,
            MonthlyTrend = monthlyTrend
        };
    }
}
