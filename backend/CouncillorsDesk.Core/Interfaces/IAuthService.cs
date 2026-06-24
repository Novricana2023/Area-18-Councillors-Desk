using CouncillorsDesk.Core.DTOs.Auth;

namespace CouncillorsDesk.Core.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> CitizenLoginAsync(LoginDto dto, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> CouncillorLoginAsync(LoginDto dto, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> GoogleAuthAsync(GoogleAuthDto dto, CancellationToken cancellationToken = default);
    Task<AuthResponseDto?> GetCurrentUserAsync(string userId, CancellationToken cancellationToken = default);
    Task UpdateProfileAsync(string userId, UpdateProfileDto dto, CancellationToken cancellationToken = default);
    Task ForgotPasswordAsync(ForgotPasswordDto dto, CancellationToken cancellationToken = default);
    Task ResetPasswordAsync(ResetPasswordDto dto, CancellationToken cancellationToken = default);
}
