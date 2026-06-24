using CouncillorsDesk.Core.Enums;

namespace CouncillorsDesk.Core.DTOs.Issue;

public class IssueSearchDto
{
    public string? Query { get; set; }
    public IssueCategory? Category { get; set; }
    public IssueStatus? Status { get; set; }
    /// <summary>When true, only resolved/closed issues. When false, only open/active issues.</summary>
    public bool? SolvedOnly { get; set; }
    public string? ReporterId { get; set; }
    public string? AssignedToId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
