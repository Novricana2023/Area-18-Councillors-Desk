using CouncillorsDesk.Core.Enums;

namespace CouncillorsDesk.Core.Entities;

public class IssueUpdate
{
    public Guid Id { get; set; }
    public Guid IssueReportId { get; set; }
    public string UpdatedById { get; set; } = string.Empty;
    public IssueStatus? PreviousStatus { get; set; }
    public IssueStatus NewStatus { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public IssueReport IssueReport { get; set; } = null!;
    public ApplicationUser UpdatedBy { get; set; } = null!;
}
