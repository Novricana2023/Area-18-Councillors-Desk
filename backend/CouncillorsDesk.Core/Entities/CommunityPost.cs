using CouncillorsDesk.Core.Enums;

namespace CouncillorsDesk.Core.Entities;

public class CommunityPost
{
    public Guid Id { get; set; }
    public string AuthorId { get; set; } = string.Empty;
    public FeedCategory Category { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsPinned { get; set; }
    public bool IsPublished { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ApplicationUser Author { get; set; } = null!;
    public ICollection<PostComment> Comments { get; set; } = [];
    public ICollection<PostLike> Likes { get; set; } = [];
    public ICollection<PostFollow> Follows { get; set; } = [];
}
