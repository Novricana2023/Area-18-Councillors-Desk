namespace CouncillorsDesk.Core.Interfaces;

public interface IEmailService
{
    Task SendAsync(string to, string subject, string htmlBody, CancellationToken cancellationToken = default);
    Task SendPasswordResetAsync(string to, string resetLink, CancellationToken cancellationToken = default);
    Task SendIssueStatusUpdateAsync(string to, string issueTitle, string newStatus, CancellationToken cancellationToken = default);
}
