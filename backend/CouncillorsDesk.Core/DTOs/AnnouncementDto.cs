using CouncillorsDesk.Core.Enums;

namespace CouncillorsDesk.Core.DTOs;

public class AnnouncementDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public FeedCategory Category { get; set; }
    public bool IsActive { get; set; }
    public string AuthorId { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    public DateTime CreatedAt { get; set; }
    public IReadOnlyList<AnnouncementCommentDto> Comments { get; set; } = [];
}
