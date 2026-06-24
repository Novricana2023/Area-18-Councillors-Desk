using System.ComponentModel.DataAnnotations;
using CouncillorsDesk.Core.Enums;

namespace CouncillorsDesk.Core.DTOs.Issue;

public class UpdateIssueDto
{
    [MaxLength(200)]
    public string? Title { get; set; }

    [MaxLength(4000)]
    public string? Description { get; set; }

    public IssueCategory? Category { get; set; }

    [MaxLength(500)]
    public string? Location { get; set; }

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public IssueStatus? Status { get; set; }

    public string? AssignedToId { get; set; }
}
