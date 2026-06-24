using CouncillorsDesk.Core.Enums;

namespace CouncillorsDesk.Core.Entities;

public class IssueReport
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public IssueCategory Category { get; set; }
    public IssueStatus Status { get; set; } = IssueStatus.Submitted;
    public string Location { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string ReporterId { get; set; } = string.Empty;
    public string? AssignedToId { get; set; }
    public string? ReferenceNumber { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    /// <summary>When true, only the reporter, assignee, and staff can view this report.</summary>
    public bool IsPrivate { get; set; }
    /// <summary>When true, only councillors/staff may post new comments.</summary>
    public bool CommentsClosed { get; set; }

    public ApplicationUser Reporter { get; set; } = null!;
    public ApplicationUser? AssignedTo { get; set; }
    public ICollection<IssuePhoto> Photos { get; set; } = [];
    public ICollection<IssueUpdate> Updates { get; set; } = [];
    public ICollection<IssueComment> Comments { get; set; } = [];
}
