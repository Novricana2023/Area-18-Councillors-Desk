using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using CouncillorsDesk.Core.Interfaces;
using CouncillorsDesk.Infrastructure.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CouncillorsDesk.Infrastructure.Services;

/// <summary>
/// Stores uploaded images in Cloudinary for cloud-hosted production deployments.
/// </summary>
public class CloudinaryImageStorageService : IImageStorageService
{
    private readonly Cloudinary _cloudinary;
    private readonly CloudinaryOptions _options;
    private readonly ILogger<CloudinaryImageStorageService> _logger;

    public CloudinaryImageStorageService(IOptions<CloudinaryOptions> options, ILogger<CloudinaryImageStorageService> logger)
    {
        _options = options.Value;
        _logger = logger;

        var account = new Account(_options.CloudName, _options.ApiKey, _options.ApiSecret);
        _cloudinary = new Cloudinary(account);
    }

    public async Task<string> UploadAsync(
        Stream imageStream,
        string fileName,
        string folder,
        CancellationToken cancellationToken = default)
    {
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, imageStream),
            Folder = $"area18/{folder}",
            UseFilename = true,
            UniqueFilename = true,
            Overwrite = false
        };

        var result = await _cloudinary.UploadAsync(uploadParams);
        if (result.Error is not null)
        {
            _logger.LogError("Cloudinary upload failed: {Message}", result.Error.Message);
            throw new InvalidOperationException($"Image upload failed: {result.Error.Message}");
        }

        return result.SecureUrl.ToString();
    }

    public async Task DeleteAsync(string imageUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
        {
            return;
        }

        var publicId = ExtractPublicId(imageUrl);
        if (string.IsNullOrWhiteSpace(publicId))
        {
            return;
        }

        var result = await _cloudinary.DestroyAsync(new DeletionParams(publicId));
        if (result.Result != "ok" && result.Result != "not found")
        {
            _logger.LogWarning("Cloudinary delete returned: {Result}", result.Result);
        }
    }

    public string GetPublicUrl(string publicId)
        => _cloudinary.Api.UrlImgUp.BuildUrl(publicId);

    private static string? ExtractPublicId(string imageUrl)
    {
        if (!Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri))
        {
            return null;
        }

        var segments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
        var uploadIndex = Array.IndexOf(segments, "upload");
        if (uploadIndex < 0 || uploadIndex + 1 >= segments.Length)
        {
            return null;
        }

        // Skip version segment if present (v1234567890).
        var start = uploadIndex + 1;
        if (segments[start].StartsWith('v') && segments[start].Length > 1 && segments[start][1..].All(char.IsDigit))
        {
            start++;
        }

        return string.Join('/', segments[start..]).Replace(Path.GetExtension(segments[^1]), string.Empty);
    }
}
