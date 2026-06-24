using CouncillorsDesk.Core.Enums;

namespace CouncillorsDesk.Core.DTOs.Feed;

public class PostDto
{
    public Guid Id { get; set; }
    public FeedCategory Category { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsPinned { get; set; }
    public string AuthorId { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public string? AuthorPhotoUrl { get; set; }
    public int LikeCount { get; set; }
    public int CommentCount { get; set; }
    public int FollowCount { get; set; }
    public bool IsLikedByCurrentUser { get; set; }
    public bool IsFollowedByCurrentUser { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public IReadOnlyList<CommentDto> Comments { get; set; } = [];
}
