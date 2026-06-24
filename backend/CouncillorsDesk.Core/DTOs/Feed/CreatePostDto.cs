using System.ComponentModel.DataAnnotations;
using CouncillorsDesk.Core.Enums;

namespace CouncillorsDesk.Core.DTOs.Feed;

public class CreatePostDto
{
    [Required]
    public FeedCategory Category { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(8000)]
    public string Content { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }
}
