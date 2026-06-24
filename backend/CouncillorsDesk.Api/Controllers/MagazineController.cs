using CouncillorsDesk.Api.Extensions;
using CouncillorsDesk.Core.DTOs.Magazine;
using CouncillorsDesk.Core.Enums;
using CouncillorsDesk.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CouncillorsDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MagazineController : ControllerBase
{
    private readonly IMagazineService _magazineService;

    public MagazineController(IMagazineService magazineService)
    {
        _magazineService = magazineService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<ArticleDto>>> GetPublished(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var articles = await _magazineService.GetPublishedAsync(page, pageSize, cancellationToken);
        return Ok(articles);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ArticleDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var article = await _magazineService.GetByIdAsync(id, cancellationToken);
        return article is null ? NotFound() : Ok(article);
    }

    [HttpPost]
    [Authorize(Roles = $"{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<ActionResult<ArticleDto>> Create(CreateArticleDto dto, CancellationToken cancellationToken)
    {
        var article = await _magazineService.CreateAsync(User.GetUserId(), dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = article.Id }, article);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<ActionResult<ArticleDto>> Update(
        Guid id,
        CreateArticleDto dto,
        CancellationToken cancellationToken)
    {
        var article = await _magazineService.UpdateAsync(id, User.GetUserId(), dto, cancellationToken);
        return article is null ? NotFound() : Ok(article);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = $"{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _magazineService.DeleteAsync(id, User.GetUserId(), cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
