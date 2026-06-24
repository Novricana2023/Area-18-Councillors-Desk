using CouncillorsDesk.Core.Enums;

namespace CouncillorsDesk.Core.DTOs.Dashboard;

public class TransparencyStatsDto
{
    public int TotalIssues { get; set; }
    public int ResolvedIssues { get; set; }
    public int OpenIssues { get; set; }
    public double ResolutionRate { get; set; }
    public double AverageResolutionDays { get; set; }
    public IReadOnlyDictionary<IssueCategory, int> IssuesByCategory { get; set; } = new Dictionary<IssueCategory, int>();
    public IReadOnlyDictionary<IssueStatus, int> IssuesByStatus { get; set; } = new Dictionary<IssueStatus, int>();
    public IReadOnlyList<MonthlyIssueStatsDto> MonthlyTrend { get; set; } = [];
}

public class MonthlyIssueStatsDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public int Submitted { get; set; }
    public int Resolved { get; set; }
}
