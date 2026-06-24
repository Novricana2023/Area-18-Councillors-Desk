using CouncillorsDesk.Core.DTOs.Dashboard;
using CouncillorsDesk.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CouncillorsDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransparencyController : ControllerBase
{
    private readonly ITransparencyService _transparencyService;
    private readonly IPdfService _pdfService;

    public TransparencyController(ITransparencyService transparencyService, IPdfService pdfService)
    {
        _transparencyService = transparencyService;
        _pdfService = pdfService;
    }

    [HttpGet("stats")]
    [AllowAnonymous]
    public async Task<ActionResult<TransparencyStatsDto>> GetStats(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        CancellationToken cancellationToken = default)
    {
        var stats = await _transparencyService.GetStatsAsync(fromDate, toDate, cancellationToken);
        return Ok(stats);
    }

    [HttpGet("report")]
    [AllowAnonymous]
    public async Task<IActionResult> DownloadReport(CancellationToken cancellationToken)
    {
        var pdfBytes = await _pdfService.GenerateTransparencyReportPdfAsync(cancellationToken);
        return File(pdfBytes, "application/pdf", "area18-transparency-report.pdf");
    }
}
