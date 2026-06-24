using CouncillorsDesk.Core.DTOs.Magazine;

namespace CouncillorsDesk.Core.Interfaces;

public interface IMagazineService
{
    Task<ArticleDto> CreateAsync(string authorId, CreateArticleDto dto, CancellationToken cancellationToken = default);
    Task<ArticleDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ArticleDto>> GetPublishedAsync(int page = 1, int pageSize = 20, CancellationToken cancellationToken = default);
    Task<ArticleDto?> UpdateAsync(Guid id, string authorId, CreateArticleDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, string authorId, CancellationToken cancellationToken = default);
}
