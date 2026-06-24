using CouncillorsDesk.Core.DTOs.Issue;

namespace CouncillorsDesk.Core.Interfaces;

public interface IPdfService
{
    Task<byte[]> GenerateIssueReportPdfAsync(IssueDetailDto issue, CancellationToken cancellationToken = default);
    Task<byte[]> GenerateTransparencyReportPdfAsync(CancellationToken cancellationToken = default);
}
