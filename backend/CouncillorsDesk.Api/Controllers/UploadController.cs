using CouncillorsDesk.Api.Extensions;
using CouncillorsDesk.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CouncillorsDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadController : ControllerBase
{
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"
    };

    private const long MaxFileSizeBytes = 5 * 1024 * 1024;

    private readonly IImageStorageService _imageStorageService;

    public UploadController(IImageStorageService imageStorageService)
    {
        _imageStorageService = imageStorageService;
    }

    [HttpPost("image")]
    [RequestSizeLimit(MaxFileSizeBytes)]
    public async Task<IActionResult> UploadImage(
        IFormFile file,
        [FromQuery] string folder = "general",
        CancellationToken cancellationToken = default)
    {
        if (file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded." });
        }

        if (file.Length > MaxFileSizeBytes)
        {
            return BadRequest(new { message = "File exceeds the 5 MB limit." });
        }

        if (!AllowedContentTypes.Contains(file.ContentType))
        {
            return BadRequest(new { message = "Only JPEG, PNG, GIF, and WebP images are allowed." });
        }

        var safeFolder = string.IsNullOrWhiteSpace(folder) ? "general" : folder.Trim('/');
        await using var stream = file.OpenReadStream();
        var url = await _imageStorageService.UploadAsync(stream, file.FileName, safeFolder, cancellationToken);

        return Ok(new { url });
    }
}
