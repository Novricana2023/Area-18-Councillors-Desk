using CouncillorsDesk.Core.Entities;
using CouncillorsDesk.Core.Interfaces;
using CouncillorsDesk.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Storage;

namespace CouncillorsDesk.Infrastructure.Repositories;

/// <summary>
/// Unit of work coordinating repositories and database transactions.
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _transaction;

    private IRepository<IssueReport>? _issues;
    private IRepository<IssuePhoto>? _issuePhotos;
    private IRepository<IssueUpdate>? _issueUpdates;
    private IRepository<IssueComment>? _issueComments;
    private IRepository<CommunityPost>? _communityPosts;
    private IRepository<PostComment>? _postComments;
    private IRepository<PostLike>? _postLikes;
    private IRepository<PostFollow>? _postFollows;
    private IRepository<ContentReport>? _contentReports;
    private IRepository<Notification>? _notifications;
    private IRepository<MagazineArticle>? _magazineArticles;
    private IRepository<Announcement>? _announcements;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IRepository<IssueReport> Issues => _issues ??= new Repository<IssueReport>(_context);
    public IRepository<IssuePhoto> IssuePhotos => _issuePhotos ??= new Repository<IssuePhoto>(_context);
    public IRepository<IssueUpdate> IssueUpdates => _issueUpdates ??= new Repository<IssueUpdate>(_context);
    public IRepository<IssueComment> IssueComments => _issueComments ??= new Repository<IssueComment>(_context);
    public IRepository<CommunityPost> CommunityPosts => _communityPosts ??= new Repository<CommunityPost>(_context);
    public IRepository<PostComment> PostComments => _postComments ??= new Repository<PostComment>(_context);
    public IRepository<PostLike> PostLikes => _postLikes ??= new Repository<PostLike>(_context);
    public IRepository<PostFollow> PostFollows => _postFollows ??= new Repository<PostFollow>(_context);
    public IRepository<ContentReport> ContentReports => _contentReports ??= new Repository<ContentReport>(_context);
    public IRepository<Notification> Notifications => _notifications ??= new Repository<Notification>(_context);
    public IRepository<MagazineArticle> MagazineArticles => _magazineArticles ??= new Repository<MagazineArticle>(_context);
    public IRepository<Announcement> Announcements => _announcements ??= new Repository<Announcement>(_context);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => _context.SaveChangesAsync(cancellationToken);

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is not null)
        {
            return;
        }

        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is null)
        {
            return;
        }

        await _transaction.CommitAsync(cancellationToken);
        await _transaction.DisposeAsync();
        _transaction = null;
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction is null)
        {
            return;
        }

        await _transaction.RollbackAsync(cancellationToken);
        await _transaction.DisposeAsync();
        _transaction = null;
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }

    public async ValueTask DisposeAsync()
    {
        if (_transaction is not null)
        {
            await _transaction.DisposeAsync();
        }

        await _context.DisposeAsync();
    }
}
