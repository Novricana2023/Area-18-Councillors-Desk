using CouncillorsDesk.Api.Extensions;
using CouncillorsDesk.Api.Models;
using CouncillorsDesk.Core.DTOs.Feed;
using CouncillorsDesk.Core.Enums;
using CouncillorsDesk.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CouncillorsDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeedController : ControllerBase
{
    private readonly IFeedService _feedService;

    public FeedController(IFeedService feedService)
    {
        _feedService = feedService;
    }

    [HttpGet("posts")]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<PostDto>>> GetPosts(
        [FromQuery] FeedCategory? category,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var posts = await _feedService.GetPostsAsync(
            category,
            page,
            pageSize,
            User.GetOptionalUserId(),
            cancellationToken);

        return Ok(posts);
    }

    [HttpGet("posts/{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<PostDto>> GetPost(Guid id, CancellationToken cancellationToken)
    {
        var post = await _feedService.GetPostByIdAsync(id, User.GetOptionalUserId(), cancellationToken);
        return post is null ? NotFound() : Ok(post);
    }

    [HttpPost("posts")]
    [Authorize(Roles = $"{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<ActionResult<PostDto>> CreatePost(CreatePostDto dto, CancellationToken cancellationToken)
    {
        var post = await _feedService.CreatePostAsync(User.GetUserId(), dto, cancellationToken);
        return CreatedAtAction(nameof(GetPost), new { id = post.Id }, post);
    }

    [HttpDelete("posts/{id:guid}")]
    [Authorize(Roles = $"{UserRole.Resident},{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<IActionResult> DeletePost(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _feedService.DeletePostAsync(id, User.GetUserId(), cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("posts/{id:guid}/comments")]
    [Authorize(Roles = $"{UserRole.Resident},{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<ActionResult<CommentDto>> AddComment(
        Guid id,
        AddFeedCommentRequest request,
        CancellationToken cancellationToken)
    {
        var comment = await _feedService.AddCommentAsync(id, User.GetUserId(), request.Content, cancellationToken);
        return Ok(comment);
    }

    [HttpPost("posts/{postId:guid}/comments/{commentId:guid}/replies")]
    [Authorize(Roles = $"{UserRole.Resident},{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<ActionResult<ReplyDto>> AddReply(
        Guid postId,
        Guid commentId,
        AddFeedCommentRequest request,
        CancellationToken cancellationToken)
    {
        var reply = await _feedService.AddReplyAsync(
            postId,
            commentId,
            User.GetUserId(),
            request.Content,
            cancellationToken);

        return Ok(reply);
    }

    [HttpPost("posts/{id:guid}/like")]
    [Authorize(Roles = $"{UserRole.Resident},{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<IActionResult> ToggleLike(Guid id, CancellationToken cancellationToken)
    {
        var liked = await _feedService.ToggleLikeAsync(id, User.GetUserId(), cancellationToken);
        return Ok(new { liked });
    }

    [HttpPost("posts/{id:guid}/follow")]
    [Authorize(Roles = $"{UserRole.Resident},{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<IActionResult> ToggleFollow(Guid id, CancellationToken cancellationToken)
    {
        var following = await _feedService.ToggleFollowAsync(id, User.GetUserId(), cancellationToken);
        return Ok(new { following });
    }

    [HttpPost("report")]
    [Authorize(Roles = $"{UserRole.Resident},{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<IActionResult> ReportContent(ReportContentRequest request, CancellationToken cancellationToken)
    {
        var reportId = await _feedService.ReportContentAsync(
            User.GetUserId(),
            request.TargetType,
            request.TargetId,
            request.Reason,
            request.Details,
            cancellationToken);

        return Ok(new { reportId });
    }
}
