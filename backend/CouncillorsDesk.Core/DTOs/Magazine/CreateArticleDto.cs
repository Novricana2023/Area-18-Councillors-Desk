using System.ComponentModel.DataAnnotations;

namespace CouncillorsDesk.Core.DTOs.Magazine;

public class CreateArticleDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Summary { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    public string? CoverImageUrl { get; set; }

    public bool IsPublished { get; set; }
}
