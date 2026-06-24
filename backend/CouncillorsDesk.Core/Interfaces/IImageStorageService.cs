namespace CouncillorsDesk.Core.Interfaces;

public interface IImageStorageService
{
    Task<string> UploadAsync(Stream imageStream, string fileName, string folder, CancellationToken cancellationToken = default);
    Task DeleteAsync(string imageUrl, CancellationToken cancellationToken = default);
    string GetPublicUrl(string publicId);
}
