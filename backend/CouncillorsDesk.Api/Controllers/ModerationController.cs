using CouncillorsDesk.Api.Extensions;
using CouncillorsDesk.Core.Enums;
using CouncillorsDesk.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CouncillorsDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = $"{UserRole.Councillor},{UserRole.Admin},{UserRole.Staff}")]
public class ModerationController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ModerationController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("reports")]
    public async Task<ActionResult<IReadOnlyList<ContentReportDto>>> GetReports(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var reports = await _context.ContentReports
            .AsNoTracking()
            .Include(r => r.Reporter)
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new ContentReportDto
            {
                Id = r.Id,
                TargetType = r.TargetType,
                TargetId = r.TargetId,
                Reason = r.Reason,
                Details = r.Details,
                Status = r.Status,
                ReporterName = r.Reporter.FullName,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(reports);
    }

    [HttpPut("reports/{id:guid}")]
    public async Task<IActionResult> ReviewReport(
        Guid id,
        ReviewReportRequest request,
        CancellationToken cancellationToken)
    {
        var report = await _context.ContentReports.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
        if (report is null)
        {
            return NotFound();
        }

        if (!Enum.TryParse<ContentReportStatus>(request.Status, true, out var status))
        {
            return BadRequest(new { message = "Invalid status value." });
        }

        report.Status = status;
        report.ReviewedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}

public class ContentReportDto
{
    public Guid Id { get; set; }
    public ContentReportTargetType TargetType { get; set; }
    public Guid TargetId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Details { get; set; }
    public ContentReportStatus Status { get; set; }
    public string ReporterName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class ReviewReportRequest
{
    public string Status { get; set; } = string.Empty;
}
