namespace CouncillorsDesk.Core.Entities;

public class PostFollow
{
    public Guid Id { get; set; }
    public Guid PostId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public CommunityPost Post { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
}
