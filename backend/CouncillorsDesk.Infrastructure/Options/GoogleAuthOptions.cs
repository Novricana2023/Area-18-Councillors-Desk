namespace CouncillorsDesk.Infrastructure.Options;

/// <summary>
/// Google OAuth client configuration for ID token validation.
/// </summary>
public class GoogleAuthOptions
{
    public const string SectionName = "Google";

    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;

    /// <summary>True when ClientId is set — required for Google Sign-In (ID token validation).</summary>
    public bool IsClientIdConfigured => !string.IsNullOrWhiteSpace(ClientId);

    /// <summary>True when both ClientId and ClientSecret are set — enables server-side Google OAuth middleware.</summary>
    public bool IsOAuthConfigured => IsClientIdConfigured && !string.IsNullOrWhiteSpace(ClientSecret);
}
