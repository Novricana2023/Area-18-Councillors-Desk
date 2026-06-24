using CouncillorsDesk.Core.DTOs.Feed;
using CouncillorsDesk.Core.Entities;
using CouncillorsDesk.Core.Enums;
using CouncillorsDesk.Core.Interfaces;
using CouncillorsDesk.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CouncillorsDesk.Infrastructure.Services;

/// <summary>
/// Manages the community feed: posts, comments, replies, likes, follows, and content reports.
/// </summary>
public class FeedService : IFeedService
{
    private readonly ApplicationDbContext _context;

    public FeedService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PostDto> CreatePostAsync(string authorId, CreatePostDto dto, CancellationToken cancellationToken = default)
    {
        var post = new CommunityPost
        {
            Id = Guid.NewGuid(),
            AuthorId = authorId,
            Category = dto.Category,
            Title = dto.Title,
            Content = dto.Content,
            ImageUrl = dto.ImageUrl,
            IsPublished = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.CommunityPosts.Add(post);
        await _context.SaveChangesAsync(cancellationToken);

        return (await GetPostByIdAsync(post.Id, authorId, cancellationToken))!;
    }

    public async Task<PostDto?> GetPostByIdAsync(Guid id, string? currentUserId = null, CancellationToken cancellationToken = default)
    {
        var post = await LoadPostQuery()
            .FirstOrDefaultAsync(p => p.Id == id && p.IsPublished, cancellationToken);

        return post is null ? null : MapToPostDto(post, currentUserId);
    }

    public async Task<IReadOnlyList<PostDto>> GetPostsAsync(
        FeedCategory? category = null,
        int page = 1,
        int pageSize = 20,
        string? currentUserId = null,
        CancellationToken cancellationToken = default)
    {
        var query = LoadPostQuery().Where(p => p.IsPublished);

        if (category.HasValue)
        {
            query = query.Where(p => p.Category == category.Value);
        }

        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var posts = await query
            .OrderByDescending(p => p.IsPinned)
            .ThenByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return posts.Select(p => MapToPostDto(p, currentUserId)).ToList();
    }

    public async Task<CommentDto> AddCommentAsync(
        Guid postId,
        string userId,
        string content,
        CancellationToken cancellationToken = default)
    {
        var post = await _context.CommunityPosts.FindAsync([postId], cancellationToken)
            ?? throw new KeyNotFoundException("Post not found.");

        var user = await _context.Users.FindAsync([userId], cancellationToken)
            ?? throw new KeyNotFoundException("User not found.");

        var comment = new PostComment
        {
            Id = Guid.NewGuid(),
            PostId = postId,
            UserId = userId,
            Content = content,
            CreatedAt = DateTime.UtcNow
        };

        _context.PostComments.Add(comment);
        post.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return new CommentDto
        {
            Id = comment.Id,
            UserId = user.Id,
            UserName = user.FullName,
            UserPhotoUrl = user.ProfilePhotoUrl,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            Replies = []
        };
    }

    public async Task<ReplyDto> AddReplyAsync(
        Guid postId,
        Guid parentCommentId,
        string userId,
        string content,
        CancellationToken cancellationToken = default)
    {
        var parent = await _context.PostComments
            .FirstOrDefaultAsync(c => c.Id == parentCommentId && c.PostId == postId, cancellationToken)
            ?? throw new KeyNotFoundException("Parent comment not found.");

        var user = await _context.Users.FindAsync([userId], cancellationToken)
            ?? throw new KeyNotFoundException("User not found.");

        var reply = new PostComment
        {
            Id = Guid.NewGuid(),
            PostId = postId,
            UserId = userId,
            ParentCommentId = parent.Id,
            Content = content,
            CreatedAt = DateTime.UtcNow
        };

        _context.PostComments.Add(reply);
        await _context.SaveChangesAsync(cancellationToken);

        return new ReplyDto
        {
            Id = reply.Id,
            UserId = user.Id,
            UserName = user.FullName,
            UserPhotoUrl = user.ProfilePhotoUrl,
            Content = reply.Content,
            CreatedAt = reply.CreatedAt
        };
    }

    public async Task<bool> ToggleLikeAsync(Guid postId, string userId, CancellationToken cancellationToken = default)
    {
        var existing = await _context.PostLikes
            .FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId, cancellationToken);

        if (existing is not null)
        {
            _context.PostLikes.Remove(existing);
            await _context.SaveChangesAsync(cancellationToken);
            return false;
        }

        _context.PostLikes.Add(new PostLike
        {
            Id = Guid.NewGuid(),
            PostId = postId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> ToggleFollowAsync(Guid postId, string userId, CancellationToken cancellationToken = default)
    {
        var existing = await _context.PostFollows
            .FirstOrDefaultAsync(f => f.PostId == postId && f.UserId == userId, cancellationToken);

        if (existing is not null)
        {
            _context.PostFollows.Remove(existing);
            await _context.SaveChangesAsync(cancellationToken);
            return false;
        }

        _context.PostFollows.Add(new PostFollow
        {
            Id = Guid.NewGuid(),
            PostId = postId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeletePostAsync(Guid id, string userId, CancellationToken cancellationToken = default)
    {
        var post = await _context.CommunityPosts
            .Include(p => p.Author)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (post is null)
        {
            return false;
        }

        var user = await _context.Users.FindAsync([userId], cancellationToken);
        if (user is null)
        {
            return false;
        }

        var isStaff = user.Role is UserRole.Admin or UserRole.Councillor or UserRole.Staff;
        if (post.AuthorId != userId && !isStaff)
        {
            throw new UnauthorizedAccessException("You are not allowed to delete this post.");
        }

        _context.CommunityPosts.Remove(post);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    /// <summary>
    /// Reports inappropriate feed content for moderator review.
    /// </summary>
    public async Task<Guid> ReportContentAsync(
        string reporterId,
        ContentReportTargetType targetType,
        Guid targetId,
        string reason,
        string? details = null,
        CancellationToken cancellationToken = default)
    {
        var report = new ContentReport
        {
            Id = Guid.NewGuid(),
            ReporterId = reporterId,
            TargetType = targetType,
            TargetId = targetId,
            Reason = reason,
            Details = details,
            Status = ContentReportStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _context.ContentReports.Add(report);
        await _context.SaveChangesAsync(cancellationToken);
        return report.Id;
    }

    private IQueryable<CommunityPost> LoadPostQuery() =>
        _context.CommunityPosts
            .AsNoTracking()
            .Include(p => p.Author)
            .Include(p => p.Likes)
            .Include(p => p.Follows)
            .Include(p => p.Comments).ThenInclude(c => c.User)
            .Include(p => p.Comments).ThenInclude(c => c.Replies).ThenInclude(r => r.User);

    private static PostDto MapToPostDto(CommunityPost post, string? currentUserId)
    {
        var topLevelComments = post.Comments
            .Where(c => c.ParentCommentId is null)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new CommentDto
            {
                Id = c.Id,
                UserId = c.UserId,
                UserName = c.User.FullName,
                UserPhotoUrl = c.User.ProfilePhotoUrl,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                Replies = c.Replies
                    .OrderBy(r => r.CreatedAt)
                    .Select(r => new ReplyDto
                    {
                        Id = r.Id,
                        UserId = r.UserId,
                        UserName = r.User.FullName,
                        UserPhotoUrl = r.User.ProfilePhotoUrl,
                        Content = r.Content,
                        CreatedAt = r.CreatedAt
                    })
                    .ToList()
            })
            .ToList();

        return new PostDto
        {
            Id = post.Id,
            Category = post.Category,
            Title = post.Title,
            Content = post.Content,
            ImageUrl = post.ImageUrl,
            IsPinned = post.IsPinned,
            AuthorId = post.AuthorId,
            AuthorName = post.Author.FullName,
            AuthorPhotoUrl = post.Author.ProfilePhotoUrl,
            LikeCount = post.Likes.Count,
            CommentCount = post.Comments.Count(c => c.ParentCommentId is null),
            FollowCount = post.Follows.Count,
            IsLikedByCurrentUser = currentUserId is not null && post.Likes.Any(l => l.UserId == currentUserId),
            IsFollowedByCurrentUser = currentUserId is not null && post.Follows.Any(f => f.UserId == currentUserId),
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt,
            Comments = topLevelComments
        };
    }
}
