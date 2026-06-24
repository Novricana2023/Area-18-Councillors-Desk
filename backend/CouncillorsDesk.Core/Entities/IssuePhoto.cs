namespace CouncillorsDesk.Core.Entities;

public class IssuePhoto
{
    public Guid Id { get; set; }
    public Guid IssueReportId { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? Caption { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public IssueReport IssueReport { get; set; } = null!;
}
