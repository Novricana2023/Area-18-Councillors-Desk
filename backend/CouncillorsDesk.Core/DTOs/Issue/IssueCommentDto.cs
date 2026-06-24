namespace CouncillorsDesk.Core.DTOs.Issue;

public class IssueCommentDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string? UserCommentNote { get; set; }
    public string? UserPhotoUrl { get; set; }
    public Guid? ParentCommentId { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsOfficialResponse { get; set; }
    public DateTime CreatedAt { get; set; }
    public IReadOnlyList<IssueCommentDto> Replies { get; set; } = [];
}
