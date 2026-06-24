namespace CouncillorsDesk.Core.DTOs;

public class AnnouncementCommentDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string? UserCommentNote { get; set; }
    public Guid? ParentCommentId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public IReadOnlyList<AnnouncementCommentDto> Replies { get; set; } = [];
}
