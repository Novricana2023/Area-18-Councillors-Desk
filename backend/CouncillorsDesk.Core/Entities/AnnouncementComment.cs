namespace CouncillorsDesk.Core.Entities;

public class AnnouncementComment
{
    public Guid Id { get; set; }
    public Guid AnnouncementId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public Guid? ParentCommentId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Announcement Announcement { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
    public AnnouncementComment? ParentComment { get; set; }
    public ICollection<AnnouncementComment> Replies { get; set; } = [];
}
