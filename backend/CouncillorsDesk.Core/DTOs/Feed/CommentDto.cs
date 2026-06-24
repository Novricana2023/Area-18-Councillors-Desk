namespace CouncillorsDesk.Core.DTOs.Feed;

public class CommentDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string? UserPhotoUrl { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public IReadOnlyList<ReplyDto> Replies { get; set; } = [];
}
