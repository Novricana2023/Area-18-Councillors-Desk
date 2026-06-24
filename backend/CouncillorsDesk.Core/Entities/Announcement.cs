using CouncillorsDesk.Core.Enums;

namespace CouncillorsDesk.Core.Entities;

public class Announcement
{
    public Guid Id { get; set; }
    public string AuthorId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public FeedCategory Category { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;
    public DateTime? EffectiveTo { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ApplicationUser Author { get; set; } = null!;
    public ICollection<AnnouncementComment> Comments { get; set; } = [];
}
