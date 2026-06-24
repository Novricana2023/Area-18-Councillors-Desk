using CouncillorsDesk.Api.Extensions;
using CouncillorsDesk.Api.Models;
using CouncillorsDesk.Core.DTOs.Issue;
using CouncillorsDesk.Core.Enums;
using CouncillorsDesk.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CouncillorsDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IssuesController : ControllerBase
{
    private readonly IIssueService _issueService;
    private readonly IPdfService _pdfService;

    public IssuesController(IIssueService issueService, IPdfService pdfService)
    {
        _issueService = issueService;
        _pdfService = pdfService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<IssueDto>>> Search(
        [FromQuery] IssueSearchDto search,
        CancellationToken cancellationToken)
    {
        var results = await _issueService.SearchAsync(search, cancellationToken);
        return Ok(results);
    }

    [HttpGet("my-issues")]
    [Authorize(Roles = $"{UserRole.Resident},{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<ActionResult<IReadOnlyList<IssueDto>>> GetMyIssues(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var search = new IssueSearchDto
        {
            ReporterId = User.GetUserId(),
            Page = page,
            PageSize = pageSize
        };

        var results = await _issueService.SearchAsync(search, cancellationToken);
        return Ok(results);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<IssueDetailDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var issue = await _issueService.GetByIdAsync(id, User.GetOptionalUserId(), cancellationToken);
        return issue is null ? NotFound() : Ok(issue);
    }

    [HttpPost]
    [Authorize(Roles = $"{UserRole.Resident},{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<ActionResult<IssueDetailDto>> Create(CreateIssueDto dto, CancellationToken cancellationToken)
    {
        var issue = await _issueService.CreateAsync(User.GetUserId(), dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = issue.Id }, issue);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{UserRole.Resident},{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<ActionResult<IssueDetailDto>> Update(
        Guid id,
        UpdateIssueDto dto,
        CancellationToken cancellationToken)
    {
        var issue = await _issueService.UpdateAsync(id, User.GetUserId(), dto, cancellationToken);
        return issue is null ? NotFound() : Ok(issue);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = $"{UserRole.Resident},{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _issueService.DeleteAsync(id, User.GetUserId(), cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    [HttpGet("track/{referenceNumber}")]
    [AllowAnonymous]
    public async Task<ActionResult<IssueDetailDto>> GetByReference(
        string referenceNumber,
        CancellationToken cancellationToken)
    {
        var issue = await _issueService.GetByReferenceAsync(referenceNumber, User.GetOptionalUserId(), cancellationToken);
        return issue is null ? NotFound() : Ok(issue);
    }

    [HttpPost("{id:guid}/comments/{commentId:guid}/replies")]
    [Authorize(Roles = $"{UserRole.Resident},{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<ActionResult<IssueCommentDto>> AddReply(
        Guid id,
        Guid commentId,
        AddIssueCommentRequest request,
        CancellationToken cancellationToken)
    {
        var reply = await _issueService.AddReplyAsync(
            id,
            commentId,
            User.GetUserId(),
            request.Content,
            cancellationToken);

        return Ok(reply);
    }

    [HttpPost("{id:guid}/comments")]
    [Authorize(Roles = $"{UserRole.Resident},{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<ActionResult<IssueCommentDto>> AddComment(
        Guid id,
        AddIssueCommentRequest request,
        CancellationToken cancellationToken)
    {
        var comment = await _issueService.AddCommentAsync(
            id,
            User.GetUserId(),
            request.Content,
            request.IsOfficialResponse,
            cancellationToken);

        return Ok(comment);
    }

    [HttpPost("{id:guid}/status-updates")]
    [Authorize(Roles = $"{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<ActionResult<IssueUpdateDto>> AddStatusUpdate(
        Guid id,
        AddIssueStatusUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var update = await _issueService.AddStatusUpdateAsync(
            id,
            User.GetUserId(),
            request.Status,
            request.Message,
            cancellationToken);

        return Ok(update);
    }

    [HttpPost("{id:guid}/comments/toggle")]
    [Authorize(Roles = $"{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<IActionResult> ToggleComments(
        Guid id,
        [FromBody] ToggleCommentsRequest request,
        CancellationToken cancellationToken)
    {
        var updated = await _issueService.SetCommentsClosedAsync(id, User.GetUserId(), request.Closed, cancellationToken);
        return updated ? Ok(new { commentsClosed = request.Closed }) : NotFound();
    }

    [HttpGet("{id:guid}/receipt")]
    [Authorize(Roles = $"{UserRole.Resident},{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
    public async Task<IActionResult> DownloadReceipt(Guid id, CancellationToken cancellationToken)
    {
        var issue = await _issueService.GetByIdAsync(id, User.GetUserId(), cancellationToken);
        if (issue is null)
        {
            return NotFound();
        }

        var pdfBytes = await _pdfService.GenerateIssueReportPdfAsync(issue, cancellationToken);
        var fileName = $"issue-{issue.ReferenceNumber ?? issue.Id.ToString()}.pdf";
        return File(pdfBytes, "application/pdf", fileName);
    }
}
