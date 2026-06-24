namespace CouncillorsDesk.Core.Interfaces;

public interface ISmsService
{
    Task SendAsync(string phoneNumber, string message, CancellationToken cancellationToken = default);
    Task SendIssueStatusUpdateAsync(string phoneNumber, string issueReference, string newStatus, CancellationToken cancellationToken = default);
}
