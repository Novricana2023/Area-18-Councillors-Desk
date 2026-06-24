using CouncillorsDesk.Core.Interfaces;
using CouncillorsDesk.Infrastructure.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CouncillorsDesk.Infrastructure.Services;

/// <summary>
/// Stores uploaded images on the local filesystem under a configurable base path.
/// Suitable for development and single-server deployments.
/// </summary>
public class LocalImageStorageService : IImageStorageService
{
    private readonly LocalStorageOptions _options;
    private readonly ILogger<LocalImageStorageService> _logger;

    public LocalImageStorageService(IOptions<LocalStorageOptions> options, ILogger<LocalImageStorageService> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task<string> UploadAsync(
        Stream imageStream,
        string fileName,
        string folder,
        CancellationToken cancellationToken = default)
    {
        var safeFileName = Path.GetFileName(fileName);
        var uniqueName = $"{Guid.NewGuid():N}_{safeFileName}";
        var relativePath = Path.Combine(folder, uniqueName).Replace('\\', '/');
        var fullDirectory = Path.Combine(_options.BasePath, folder);
        var fullPath = Path.Combine(fullDirectory, uniqueName);

        Directory.CreateDirectory(fullDirectory);

        await using var fileStream = File.Create(fullPath);
        await imageStream.CopyToAsync(fileStream, cancellationToken);

        _logger.LogInformation("Saved image to {Path}", fullPath);

        return $"{_options.BaseUrl.TrimEnd('/')}/{relativePath}";
    }

    public Task DeleteAsync(string imageUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
        {
            return Task.CompletedTask;
        }

        var relative = imageUrl.Replace(_options.BaseUrl.TrimEnd('/'), string.Empty).TrimStart('/');
        var fullPath = Path.Combine(_options.BasePath, relative.Replace('/', Path.DirectorySeparatorChar));

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            _logger.LogInformation("Deleted image at {Path}", fullPath);
        }

        return Task.CompletedTask;
    }

    public string GetPublicUrl(string publicId)
        => $"{_options.BaseUrl.TrimEnd('/')}/{publicId.TrimStart('/')}";
}
