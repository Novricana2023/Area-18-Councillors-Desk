using Microsoft.AspNetCore.Identity;

namespace CouncillorsDesk.Core.Entities;

public class ApplicationUser : IdentityUser
{
    public string NationalId { get; set; } = string.Empty;
    public string? ProfilePhotoUrl { get; set; }
    public string FullName { get; set; } = string.Empty;
    /// <summary>Public name shown on comments and community posts.</summary>
    public string DisplayName { get; set; } = string.Empty;
    /// <summary>Short note shown alongside comments (e.g. block or role in community).</summary>
    public string? CommentNote { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Role { get; set; } = Enums.UserRole.Resident;

    public ICollection<IssueReport> ReportedIssues { get; set; } = [];
    public ICollection<IssueReport> AssignedIssues { get; set; } = [];
    public ICollection<IssueUpdate> IssueUpdates { get; set; } = [];
    public ICollection<IssueComment> IssueComments { get; set; } = [];
    public ICollection<CommunityPost> CommunityPosts { get; set; } = [];
    public ICollection<PostComment> PostComments { get; set; } = [];
    public ICollection<PostLike> PostLikes { get; set; } = [];
    public ICollection<PostFollow> PostFollows { get; set; } = [];
    public ICollection<ContentReport> ContentReports { get; set; } = [];
    public ICollection<Notification> Notifications { get; set; } = [];
    public ICollection<MagazineArticle> MagazineArticles { get; set; } = [];
    public ICollection<Announcement> Announcements { get; set; } = [];
}
