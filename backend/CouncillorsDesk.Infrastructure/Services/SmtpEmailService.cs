using CouncillorsDesk.Core.Interfaces;
using CouncillorsDesk.Infrastructure.Options;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;

namespace CouncillorsDesk.Infrastructure.Services;

/// <summary>
/// Sends transactional email via SMTP using MailKit.
/// </summary>
public class SmtpEmailService : IEmailService
{
    private readonly SmtpOptions _options;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IOptions<SmtpOptions> options, ILogger<SmtpEmailService> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendAsync(string to, string subject, string htmlBody, CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
        {
            _logger.LogInformation("SMTP disabled; skipping email to {To} with subject {Subject}", to, subject);
            return;
        }

        var message = BuildMessage(to, subject, htmlBody);

        using var client = new SmtpClient();
        await client.ConnectAsync(_options.Host, _options.Port, _options.UseSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto, cancellationToken);

        if (!string.IsNullOrWhiteSpace(_options.Username))
        {
            await client.AuthenticateAsync(_options.Username, _options.Password, cancellationToken);
        }

        await client.SendAsync(message, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);

        _logger.LogInformation("Email sent to {To}", to);
    }

    public Task SendPasswordResetAsync(string to, string resetLink, CancellationToken cancellationToken = default)
    {
        var html = $"""
            <p>You requested a password reset for your Area 18 Councillor's Desk account.</p>
            <p><a href="{resetLink}">Reset your password</a></p>
            <p>If you did not request this, you can safely ignore this email.</p>
            """;

        return SendAsync(to, "Reset your password", html, cancellationToken);
    }

    public Task SendIssueStatusUpdateAsync(string to, string issueTitle, string newStatus, CancellationToken cancellationToken = default)
    {
        var html = $"""
            <p>Your issue <strong>{issueTitle}</strong> has been updated.</p>
            <p>New status: <strong>{newStatus}</strong></p>
            <p>Log in to the Councillor's Desk portal for full details.</p>
            """;

        return SendAsync(to, "Issue status update", html, cancellationToken);
    }

    private MimeMessage BuildMessage(string to, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_options.FromName, _options.FromEmail));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();
        return message;
    }
}
