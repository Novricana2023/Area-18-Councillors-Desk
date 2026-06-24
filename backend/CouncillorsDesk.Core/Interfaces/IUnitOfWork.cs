using CouncillorsDesk.Core.Entities;

namespace CouncillorsDesk.Core.Interfaces;

public interface IUnitOfWork : IDisposable, IAsyncDisposable
{
    IRepository<IssueReport> Issues { get; }
    IRepository<IssuePhoto> IssuePhotos { get; }
    IRepository<IssueUpdate> IssueUpdates { get; }
    IRepository<IssueComment> IssueComments { get; }
    IRepository<CommunityPost> CommunityPosts { get; }
    IRepository<PostComment> PostComments { get; }
    IRepository<PostLike> PostLikes { get; }
    IRepository<PostFollow> PostFollows { get; }
    IRepository<ContentReport> ContentReports { get; }
    IRepository<Notification> Notifications { get; }
    IRepository<MagazineArticle> MagazineArticles { get; }
    IRepository<Announcement> Announcements { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
