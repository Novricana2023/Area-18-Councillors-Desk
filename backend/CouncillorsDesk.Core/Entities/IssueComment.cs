namespace CouncillorsDesk.Core.Entities;

public class IssueComment
{
    public Guid Id { get; set; }
    public Guid IssueReportId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public Guid? ParentCommentId { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsOfficialResponse { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public IssueReport IssueReport { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
    public IssueComment? ParentComment { get; set; }
    public ICollection<IssueComment> Replies { get; set; } = [];
}
