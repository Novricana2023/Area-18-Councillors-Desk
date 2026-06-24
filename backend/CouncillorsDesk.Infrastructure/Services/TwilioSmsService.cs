using CouncillorsDesk.Core.Interfaces;
using CouncillorsDesk.Infrastructure.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Twilio;
using Twilio.Rest.Api.V2010.Account;

namespace CouncillorsDesk.Infrastructure.Services;

/// <summary>
/// Sends SMS notifications via Twilio. Falls back to no-op logging when Twilio is not configured.
/// </summary>
public class TwilioSmsService : ISmsService
{
    private readonly TwilioOptions _options;
    private readonly ILogger<TwilioSmsService> _logger;
    private readonly bool _isConfigured;

    public TwilioSmsService(IOptions<TwilioOptions> options, ILogger<TwilioSmsService> logger)
    {
        _options = options.Value;
        _logger = logger;
        _isConfigured = _options.IsConfigured;

        if (_isConfigured)
        {
            TwilioClient.Init(_options.AccountSid, _options.AuthToken);
        }
        else
        {
            _logger.LogWarning("Twilio is not configured; SMS messages will be logged only.");
        }
    }

    public async Task SendAsync(string phoneNumber, string message, CancellationToken cancellationToken = default)
    {
        if (!_isConfigured)
        {
            _logger.LogInformation("SMS (no-op) to {Phone}: {Message}", phoneNumber, message);
            return;
        }

        await MessageResource.CreateAsync(
            body: message,
            from: new Twilio.Types.PhoneNumber(_options.FromPhoneNumber),
            to: new Twilio.Types.PhoneNumber(phoneNumber));

        _logger.LogInformation("SMS sent to {Phone}", phoneNumber);
    }

    public Task SendIssueStatusUpdateAsync(string phoneNumber, string issueReference, string newStatus, CancellationToken cancellationToken = default)
        => SendAsync(phoneNumber, $"Area 18: Issue {issueReference} is now {newStatus}.", cancellationToken);
}
