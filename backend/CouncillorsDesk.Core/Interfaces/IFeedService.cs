using CouncillorsDesk.Core.DTOs.Feed;
using CouncillorsDesk.Core.Enums;

namespace CouncillorsDesk.Core.Interfaces;

public interface IFeedService
{
    Task<PostDto> CreatePostAsync(string authorId, CreatePostDto dto, CancellationToken cancellationToken = default);
    Task<PostDto?> GetPostByIdAsync(Guid id, string? currentUserId = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PostDto>> GetPostsAsync(FeedCategory? category = null, int page = 1, int pageSize = 20, string? currentUserId = null, CancellationToken cancellationToken = default);
    Task<CommentDto> AddCommentAsync(Guid postId, string userId, string content, CancellationToken cancellationToken = default);
    Task<ReplyDto> AddReplyAsync(Guid postId, Guid parentCommentId, string userId, string content, CancellationToken cancellationToken = default);
    Task<bool> ToggleLikeAsync(Guid postId, string userId, CancellationToken cancellationToken = default);
    Task<bool> ToggleFollowAsync(Guid postId, string userId, CancellationToken cancellationToken = default);
    Task<bool> DeletePostAsync(Guid id, string userId, CancellationToken cancellationToken = default);
    Task<Guid> ReportContentAsync(string reporterId, ContentReportTargetType targetType, Guid targetId, string reason, string? details = null, CancellationToken cancellationToken = default);
}
