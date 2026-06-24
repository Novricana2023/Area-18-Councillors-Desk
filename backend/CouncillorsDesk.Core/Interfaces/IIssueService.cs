using CouncillorsDesk.Core.DTOs.Issue;
using CouncillorsDesk.Core.Enums;

namespace CouncillorsDesk.Core.Interfaces;

public interface IIssueService
{
    Task<IssueDetailDto> CreateAsync(string reporterId, CreateIssueDto dto, CancellationToken cancellationToken = default);
    Task<IssueDetailDto?> GetByIdAsync(Guid id, string? currentUserId = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<IssueDto>> SearchAsync(IssueSearchDto search, CancellationToken cancellationToken = default);
    Task<IssueDetailDto?> UpdateAsync(Guid id, string userId, UpdateIssueDto dto, CancellationToken cancellationToken = default);
    Task<IssueCommentDto> AddCommentAsync(Guid issueId, string userId, string content, bool isOfficialResponse = false, CancellationToken cancellationToken = default);
    Task<IssueCommentDto> AddReplyAsync(Guid issueId, Guid parentCommentId, string userId, string content, CancellationToken cancellationToken = default);
    Task<IssueDetailDto?> GetByReferenceAsync(string referenceNumber, string? currentUserId = null, CancellationToken cancellationToken = default);
    Task<IssueUpdateDto> AddStatusUpdateAsync(Guid issueId, string userId, IssueStatus newStatus, string message, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, string userId, CancellationToken cancellationToken = default);
    Task<bool> SetCommentsClosedAsync(Guid id, string userId, bool closed, CancellationToken cancellationToken = default);
}
