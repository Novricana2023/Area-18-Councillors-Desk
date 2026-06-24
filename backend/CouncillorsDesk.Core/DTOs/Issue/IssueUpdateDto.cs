using CouncillorsDesk.Core.Enums;

namespace CouncillorsDesk.Core.DTOs.Issue;

public class IssueUpdateDto
{
    public Guid Id { get; set; }
    public IssueStatus? PreviousStatus { get; set; }
    public IssueStatus NewStatus { get; set; }
    public string Message { get; set; } = string.Empty;
    public string UpdatedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
