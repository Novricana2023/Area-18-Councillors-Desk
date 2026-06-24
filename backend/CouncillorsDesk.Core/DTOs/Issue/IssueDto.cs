using CouncillorsDesk.Core.Enums;

namespace CouncillorsDesk.Core.DTOs.Issue;

public class IssueDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public IssueCategory Category { get; set; }
    public IssueStatus Status { get; set; }
    public string Location { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? ReferenceNumber { get; set; }
    public string ReporterName { get; set; } = string.Empty;
    public string? AssignedToName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public int PhotoCount { get; set; }
    public string? CoverPhotoUrl { get; set; }
    public int CommentCount { get; set; }
    public bool CommentsClosed { get; set; }
}
