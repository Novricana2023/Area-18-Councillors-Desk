namespace CouncillorsDesk.Infrastructure.Options;

/// <summary>
/// Local filesystem image storage configuration.
/// </summary>
public class LocalStorageOptions
{
    public const string SectionName = "LocalStorage";

    public string BasePath { get; set; } = "uploads";
    public string BaseUrl { get; set; } = "/uploads";
}
