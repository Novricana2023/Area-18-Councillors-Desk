namespace CouncillorsDesk.Infrastructure.Options;

/// <summary>
/// SMTP email delivery settings bound from appsettings "Smtp" section.
/// </summary>
public class SmtpOptions
{
    public const string SectionName = "Smtp";

    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 587;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromEmail { get; set; } = "noreply@area18.mw";
    public string FromName { get; set; } = "Area 18 Councillor's Desk";
    public bool UseSsl { get; set; } = true;
    public bool Enabled { get; set; } = true;
}
