using CouncillorsDesk.Core.DTOs.Magazine;
using CouncillorsDesk.Core.Entities;
using CouncillorsDesk.Core.Enums;
using CouncillorsDesk.Core.Interfaces;
using CouncillorsDesk.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CouncillorsDesk.Infrastructure.Services;

/// <summary>
/// Manages ward magazine articles for publication on the community portal.
/// </summary>
public class MagazineService : IMagazineService
{
    private readonly ApplicationDbContext _context;

    public MagazineService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ArticleDto> CreateAsync(string authorId, CreateArticleDto dto, CancellationToken cancellationToken = default)
    {
        var article = new MagazineArticle
        {
            Id = Guid.NewGuid(),
            AuthorId = authorId,
            Title = dto.Title,
            Summary = dto.Summary,
            Content = dto.Content,
            CoverImageUrl = dto.CoverImageUrl,
            IsPublished = dto.IsPublished,
            CreatedAt = DateTime.UtcNow,
            PublishedAt = dto.IsPublished ? DateTime.UtcNow : null
        };

        _context.MagazineArticles.Add(article);
        await _context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(article.Id, cancellationToken))!;
    }

    public async Task<ArticleDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var article = await _context.MagazineArticles
            .AsNoTracking()
            .Include(a => a.Author)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        return article is null ? null : MapToDto(article);
    }

    public async Task<IReadOnlyList<ArticleDto>> GetPublishedAsync(
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var articles = await _context.MagazineArticles
            .AsNoTracking()
            .Include(a => a.Author)
            .Where(a => a.IsPublished)
            .OrderByDescending(a => a.PublishedAt ?? a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return articles.Select(MapToDto).ToList();
    }

    public async Task<ArticleDto?> UpdateAsync(
        Guid id,
        string authorId,
        CreateArticleDto dto,
        CancellationToken cancellationToken = default)
    {
        var article = await _context.MagazineArticles
            .Include(a => a.Author)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        if (article is null)
        {
            return null;
        }

        await EnsureCanModifyAsync(article, authorId, cancellationToken);

        article.Title = dto.Title;
        article.Summary = dto.Summary;
        article.Content = dto.Content;
        article.CoverImageUrl = dto.CoverImageUrl;
        article.UpdatedAt = DateTime.UtcNow;

        if (dto.IsPublished && !article.IsPublished)
        {
            article.IsPublished = true;
            article.PublishedAt = DateTime.UtcNow;
        }
        else if (!dto.IsPublished)
        {
            article.IsPublished = false;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return MapToDto(article);
    }

    public async Task<bool> DeleteAsync(Guid id, string authorId, CancellationToken cancellationToken = default)
    {
        var article = await _context.MagazineArticles.FindAsync([id], cancellationToken);
        if (article is null)
        {
            return false;
        }

        await EnsureCanModifyAsync(article, authorId, cancellationToken);

        _context.MagazineArticles.Remove(article);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task EnsureCanModifyAsync(MagazineArticle article, string authorId, CancellationToken cancellationToken)
    {
        if (article.AuthorId == authorId)
        {
            return;
        }

        var user = await _context.Users.FindAsync([authorId], cancellationToken)
            ?? throw new UnauthorizedAccessException();

        if (user.Role is not (UserRole.Admin or UserRole.Councillor or UserRole.Staff))
        {
            throw new UnauthorizedAccessException("You are not allowed to modify this article.");
        }
    }

    private static ArticleDto MapToDto(MagazineArticle article) => new()
    {
        Id = article.Id,
        Title = article.Title,
        Summary = article.Summary,
        Content = article.Content,
        CoverImageUrl = article.CoverImageUrl,
        IsPublished = article.IsPublished,
        AuthorId = article.AuthorId,
        AuthorName = article.Author.FullName,
        CreatedAt = article.CreatedAt,
        PublishedAt = article.PublishedAt,
        UpdatedAt = article.UpdatedAt
    };
}
