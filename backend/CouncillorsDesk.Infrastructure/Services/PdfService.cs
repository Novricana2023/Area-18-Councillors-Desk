using CouncillorsDesk.Core.DTOs.Issue;
using CouncillorsDesk.Core.Interfaces;
using QRCoder;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace CouncillorsDesk.Infrastructure.Services;

/// <summary>
/// Generates PDF documents for issue receipts and transparency reports using QuestPDF.
/// Includes QR codes via QRCoder for quick verification of tracking numbers.
/// </summary>
public class PdfService : IPdfService
{
    private readonly ITransparencyService _transparencyService;

    public PdfService(ITransparencyService transparencyService)
    {
        _transparencyService = transparencyService;

        // QuestPDF community license for non-commercial / qualifying organisations.
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public Task<byte[]> GenerateIssueReportPdfAsync(IssueDetailDto issue, CancellationToken cancellationToken = default)
    {
        var qrContent = issue.ReferenceNumber ?? issue.Id.ToString();
        var qrBytes = GenerateQrCode(qrContent);

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header().Column(column =>
                {
                    column.Item().Text("Area 18 Councillor's Desk").FontSize(20).Bold().FontColor(Colors.Blue.Darken2);
                    column.Item().Text("Issue Report Receipt").FontSize(14).SemiBold();
                    column.Item().PaddingTop(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                });

                page.Content().PaddingVertical(20).Column(column =>
                {
                    column.Spacing(8);

                    column.Item().Row(row =>
                    {
                        row.RelativeItem().Column(left =>
                        {
                            left.Item().Text($"Reference: {issue.ReferenceNumber ?? "N/A"}").Bold();
                            left.Item().Text($"Status: {issue.Status}");
                            left.Item().Text($"Category: {issue.Category}");
                            left.Item().Text($"Submitted: {issue.CreatedAt:yyyy-MM-dd HH:mm} UTC");
                            if (issue.ResolvedAt.HasValue)
                            {
                                left.Item().Text($"Resolved: {issue.ResolvedAt:yyyy-MM-dd HH:mm} UTC");
                            }
                        });

                        row.ConstantItem(100).Image(qrBytes);
                    });

                    column.Item().PaddingTop(10).Text(issue.Title).FontSize(16).Bold();
                    column.Item().Text(issue.Description);

                    column.Item().PaddingTop(10).Text("Location").SemiBold();
                    column.Item().Text(issue.Location);

                    if (issue.Latitude.HasValue && issue.Longitude.HasValue)
                    {
                        column.Item().Text($"Coordinates: {issue.Latitude:F6}, {issue.Longitude:F6}");
                    }

                    column.Item().PaddingTop(10).Text("Reporter").SemiBold();
                    column.Item().Text(issue.ReporterName);

                    if (!string.IsNullOrWhiteSpace(issue.AssignedToName))
                    {
                        column.Item().PaddingTop(10).Text("Assigned To").SemiBold();
                        column.Item().Text(issue.AssignedToName);
                    }

                    if (issue.Updates.Count > 0)
                    {
                        column.Item().PaddingTop(15).Text("Status History").FontSize(14).SemiBold();
                        foreach (var update in issue.Updates.OrderBy(u => u.CreatedAt))
                        {
                            column.Item().Text($"• {update.CreatedAt:yyyy-MM-dd} — {update.NewStatus}: {update.Message} ({update.UpdatedByName})");
                        }
                    }
                });

                page.Footer().AlignCenter().Text(text =>
                {
                    text.Span("Generated ");
                    text.Span(DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm")).SemiBold();
                    text.Span(" UTC — Area 18 Transparency Portal");
                });
            });
        });

        return Task.FromResult(document.GeneratePdf());
    }

    public async Task<byte[]> GenerateTransparencyReportPdfAsync(CancellationToken cancellationToken = default)
    {
        var stats = await _transparencyService.GetStatsAsync(cancellationToken: cancellationToken);

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header().Column(column =>
                {
                    column.Item().Text("Area 18 Transparency Report").FontSize(20).Bold();
                    column.Item().Text($"Generated {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC").FontSize(10).FontColor(Colors.Grey.Darken1);
                });

                page.Content().PaddingVertical(20).Column(column =>
                {
                    column.Spacing(10);

                    column.Item().Text("Summary").FontSize(14).SemiBold();
                    column.Item().Text($"Total public issues: {stats.TotalIssues}");
                    column.Item().Text($"Resolved: {stats.ResolvedIssues}");
                    column.Item().Text($"Open: {stats.OpenIssues}");
                    column.Item().Text($"Resolution rate: {stats.ResolutionRate}%");
                    column.Item().Text($"Average resolution time: {stats.AverageResolutionDays} days");

                    column.Item().PaddingTop(10).Text("Issues by Category").SemiBold();
                    foreach (var item in stats.IssuesByCategory.OrderByDescending(x => x.Value))
                    {
                        column.Item().Text($"• {item.Key}: {item.Value}");
                    }

                    column.Item().PaddingTop(10).Text("Issues by Status").SemiBold();
                    foreach (var item in stats.IssuesByStatus.OrderByDescending(x => x.Value))
                    {
                        column.Item().Text($"• {item.Key}: {item.Value}");
                    }

                    if (stats.MonthlyTrend.Count > 0)
                    {
                        column.Item().PaddingTop(10).Text("Monthly Trend").SemiBold();
                        foreach (var month in stats.MonthlyTrend)
                        {
                            column.Item().Text($"• {month.Year}-{month.Month:D2}: {month.Submitted} submitted, {month.Resolved} resolved");
                        }
                    }
                });

                page.Footer().AlignCenter().Text("Private reports are excluded from this transparency summary.");
            });
        });

        return document.GeneratePdf();
    }

    private static byte[] GenerateQrCode(string content)
    {
        using var generator = new QRCodeGenerator();
        using var data = generator.CreateQrCode(content, QRCodeGenerator.ECCLevel.Q);
        var png = new PngByteQRCode(data);
        return png.GetGraphic(8);
    }
}
