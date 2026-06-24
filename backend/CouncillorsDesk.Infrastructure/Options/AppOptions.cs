namespace CouncillorsDesk.Infrastructure.Options;

/// <summary>
/// General application settings used by infrastructure services.
/// </summary>
public class AppOptions
{
    public const string SectionName = "App";

    public string FrontendUrl { get; set; } = "http://localhost:5173";
}
