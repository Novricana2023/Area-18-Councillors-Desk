using System.ComponentModel.DataAnnotations;
using CouncillorsDesk.Core.Enums;

namespace CouncillorsDesk.Core.DTOs.Issue;

public class CreateIssueDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(4000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public IssueCategory Category { get; set; }

    [Required]
    [MaxLength(500)]
    public string Location { get; set; } = string.Empty;

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public IReadOnlyList<string>? PhotoUrls { get; set; }

    /// <summary>When true, only councillors and administrators can view this report.</summary>
    public bool IsPrivate { get; set; }
}
