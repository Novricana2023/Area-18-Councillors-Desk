namespace CouncillorsDesk.Infrastructure.Options;

/// <summary>
/// JWT bearer token configuration bound from appsettings "Jwt" section.
/// </summary>
public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = "CouncillorsDesk";
    public string Audience { get; set; } = "CouncillorsDesk";
    public int ExpirationMinutes { get; set; } = 480;
}
