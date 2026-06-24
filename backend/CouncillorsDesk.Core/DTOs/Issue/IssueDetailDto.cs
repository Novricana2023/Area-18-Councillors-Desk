using CouncillorsDesk.Core.Enums;

namespace CouncillorsDesk.Core.DTOs.Issue;

public class IssueDetailDto : IssueDto
{
    public string ReporterId { get; set; } = string.Empty;
    public string? AssignedToId { get; set; }
    public IReadOnlyList<string> PhotoUrls { get; set; } = [];
    public IReadOnlyList<IssueUpdateDto> Updates { get; set; } = [];
    public IReadOnlyList<IssueCommentDto> Comments { get; set; } = [];
}
