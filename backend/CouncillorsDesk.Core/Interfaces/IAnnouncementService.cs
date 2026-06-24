using CouncillorsDesk.Core.DTOs;
using CouncillorsDesk.Core.Enums;

namespace CouncillorsDesk.Core.Interfaces;

public interface IAnnouncementService
{
    Task<AnnouncementDto> CreateAsync(string authorId, AnnouncementDto dto, CancellationToken cancellationToken = default);
    Task<AnnouncementDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AnnouncementDto>> GetActiveAsync(FeedCategory? category = null, CancellationToken cancellationToken = default);
    Task<AnnouncementDto?> UpdateAsync(Guid id, string authorId, AnnouncementDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeactivateAsync(Guid id, string authorId, CancellationToken cancellationToken = default);
    Task<AnnouncementCommentDto> AddCommentAsync(Guid announcementId, string userId, string content, CancellationToken cancellationToken = default);
    Task<AnnouncementCommentDto> AddReplyAsync(Guid announcementId, Guid parentCommentId, string userId, string content, CancellationToken cancellationToken = default);
}
