using CouncillorsDesk.Api.Extensions;
using CouncillorsDesk.Api.Models;
using CouncillorsDesk.Core.DTOs;
using CouncillorsDesk.Core.Enums;
using CouncillorsDesk.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CouncillorsDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnnouncementsController : ControllerBase
{
    private readonly IAnnouncementService _announcementService;

    public AnnouncementsController(IAnnouncementService announcementService)
    {
        _announcementService = announcementService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<AnnouncementDto>>> GetActive(
        [FromQuery] FeedCategory? category,
        CancellationToken cancellationToken = default)
    {
        var announcements = await _announcementService.GetActiveAsync(category, cancellationToken);
        return Ok(announcements);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<AnnouncementDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var announcement = await _announcementService.GetByIdAsync(id, cancellationToken);
        return announcement is null ? NotFound() : Ok(announcement);
    }

    [HttpPost]
    [Authorize(Roles = $"{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<ActionResult<AnnouncementDto>> Create(
        CreateAnnouncementRequest request,
        CancellationToken cancellationToken)
    {
        var dto = new AnnouncementDto
        {
            Title = request.Title,
            Content = request.Content,
            Category = request.Category,
            IsActive = request.IsActive,
            EffectiveFrom = request.EffectiveFrom,
            EffectiveTo = request.EffectiveTo
        };

        var announcement = await _announcementService.CreateAsync(User.GetUserId(), dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = announcement.Id }, announcement);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<ActionResult<AnnouncementDto>> Update(
        Guid id,
        CreateAnnouncementRequest request,
        CancellationToken cancellationToken)
    {
        var dto = new AnnouncementDto
        {
            Title = request.Title,
            Content = request.Content,
            Category = request.Category,
            IsActive = request.IsActive,
            EffectiveFrom = request.EffectiveFrom,
            EffectiveTo = request.EffectiveTo
        };

        var announcement = await _announcementService.UpdateAsync(id, User.GetUserId(), dto, cancellationToken);
        return announcement is null ? NotFound() : Ok(announcement);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = $"{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken cancellationToken)
    {
        var deactivated = await _announcementService.DeactivateAsync(id, User.GetUserId(), cancellationToken);
        return deactivated ? NoContent() : NotFound();
    }

    [HttpPost("{id:guid}/comments")]
    [Authorize(Roles = $"{UserRole.Resident},{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<ActionResult<AnnouncementCommentDto>> AddComment(
        Guid id,
        AddIssueCommentRequest request,
        CancellationToken cancellationToken)
    {
        var comment = await _announcementService.AddCommentAsync(id, User.GetUserId(), request.Content, cancellationToken);
        return Ok(comment);
    }

    [HttpPost("{id:guid}/comments/{commentId:guid}/replies")]
    [Authorize(Roles = $"{UserRole.Resident},{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<ActionResult<AnnouncementCommentDto>> AddReply(
        Guid id,
        Guid commentId,
        AddIssueCommentRequest request,
        CancellationToken cancellationToken)
    {
        var reply = await _announcementService.AddReplyAsync(id, commentId, User.GetUserId(), request.Content, cancellationToken);
        return Ok(reply);
    }
}
