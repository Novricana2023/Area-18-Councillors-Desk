using CouncillorsDesk.Core.Enums;

namespace CouncillorsDesk.Core.Entities;

public class ContentReport
{
    public Guid Id { get; set; }
    public string ReporterId { get; set; } = string.Empty;
    public ContentReportTargetType TargetType { get; set; }
    public Guid TargetId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Details { get; set; }
    public ContentReportStatus Status { get; set; } = ContentReportStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }

    public ApplicationUser Reporter { get; set; } = null!;
}
