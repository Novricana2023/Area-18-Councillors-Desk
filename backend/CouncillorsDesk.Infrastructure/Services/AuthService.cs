using CouncillorsDesk.Core.Constants;
using CouncillorsDesk.Core.DTOs.Auth;
using CouncillorsDesk.Core.Entities;
using CouncillorsDesk.Core.Enums;
using CouncillorsDesk.Core.Interfaces;
using CouncillorsDesk.Infrastructure.Options;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CouncillorsDesk.Infrastructure.Services;

/// <summary>
/// Handles user registration, authentication, profile management, and password recovery.
/// </summary>
public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly TokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly GoogleAuthOptions _googleOptions;
    private readonly AppOptions _appOptions;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        TokenService tokenService,
        IEmailService emailService,
        IOptions<GoogleAuthOptions> googleOptions,
        IOptions<AppOptions> appOptions,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _emailService = emailService;
        _googleOptions = googleOptions.Value;
        _appOptions = appOptions.Value;
        _logger = logger;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken = default)
    {
        if (!dto.AgreedToTerms)
        {
            throw new InvalidOperationException("You must agree to the Terms and Conditions to register.");
        }

        var existing = await _userManager.FindByEmailAsync(dto.Email);
        if (existing is not null)
        {
            throw new InvalidOperationException("An account with this email already exists.");
        }

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FullName = dto.FullName,
            DisplayName = dto.DisplayName,
            CommentNote = dto.CommentNote,
            NationalId = dto.NationalId,
            PhoneNumber = dto.PhoneNumber,
            Role = UserRole.Resident,
            CreatedAt = DateTime.UtcNow,
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        return BuildAuthResponse(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email)
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        await NormalizeUserRoleAsync(user);

        var passwordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!passwordValid)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        return BuildAuthResponse(user);
    }

    public async Task<AuthResponseDto> CitizenLoginAsync(LoginDto dto, CancellationToken cancellationToken = default)
    {
        var result = await LoginAsync(dto, cancellationToken);
        if (IsStaffRole(result.Role))
        {
            throw new UnauthorizedAccessException(
                "This account is registered as a councillor or staff member. Please use the Councillor Portal to sign in.");
        }

        return result;
    }

    public async Task<AuthResponseDto> CouncillorLoginAsync(LoginDto dto, CancellationToken cancellationToken = default)
    {
        var result = await LoginAsync(dto, cancellationToken);
        if (!IsStaffRole(result.Role))
        {
            throw new UnauthorizedAccessException(
                "This portal is for councillors and staff only. Please use Citizen Sign In.");
        }

        return result;
    }

    public async Task<AuthResponseDto> GoogleAuthAsync(GoogleAuthDto dto, CancellationToken cancellationToken = default)
    {
        if (!_googleOptions.IsClientIdConfigured)
        {
            throw new InvalidOperationException(
                "Google authentication is not configured. Set Google__ClientId (environment variable) or Google:ClientId (user secrets).");
        }

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(
                dto.IdToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = [_googleOptions.ClientId]
                });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Google token validation failed.");
            throw new UnauthorizedAccessException("Invalid Google token.");
        }

        var email = payload.Email
            ?? throw new UnauthorizedAccessException("Google account does not include an email address.");

        var user = await _userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                FullName = payload.Name ?? email,
                DisplayName = (payload.GivenName ?? payload.Name ?? email).Split(' ')[0],
                CommentNote = "Area 18 Resident",
                NationalId = $"GOOGLE-{payload.Subject[..Math.Min(12, payload.Subject.Length)]}",
                Role = SuperAdminPolicy.IsSuperAdminEmail(email) ? UserRole.Admin : UserRole.Resident,
                ProfilePhotoUrl = payload.Picture,
                CreatedAt = DateTime.UtcNow
            };

            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                throw new InvalidOperationException(string.Join("; ", createResult.Errors.Select(e => e.Description)));
            }
        }
        else if (string.IsNullOrWhiteSpace(user.ProfilePhotoUrl) && !string.IsNullOrWhiteSpace(payload.Picture))
        {
            user.ProfilePhotoUrl = payload.Picture;
            await _userManager.UpdateAsync(user);
        }

        await NormalizeUserRoleAsync(user);

        var response = BuildAuthResponse(user);
        var portal = (dto.Portal ?? "citizen").Trim().ToLowerInvariant();

        if (portal == "councillor" && !IsStaffRole(response.Role))
        {
            throw new UnauthorizedAccessException(
                "This Google account is not registered as a councillor or staff member. Use Citizen Sign In, or contact the ward office.");
        }

        if (portal == "citizen" && IsStaffRole(response.Role))
        {
            throw new UnauthorizedAccessException(
                "This account is registered as councillor/staff. Please use the Councillor Portal.");
        }

        return response;
    }

    public async Task<AuthResponseDto?> GetCurrentUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return null;
        }

        await NormalizeUserRoleAsync(user);
        return BuildAuthResponse(user);
    }

    public async Task UpdateProfileAsync(string userId, UpdateProfileDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        if (!string.IsNullOrWhiteSpace(dto.FullName))
        {
            user.FullName = dto.FullName;
        }

        if (!string.IsNullOrWhiteSpace(dto.DisplayName))
        {
            user.DisplayName = dto.DisplayName;
        }

        if (dto.CommentNote is not null)
        {
            user.CommentNote = dto.CommentNote;
        }

        if (dto.PhoneNumber is not null)
        {
            user.PhoneNumber = dto.PhoneNumber;
        }

        if (dto.ProfilePhotoUrl is not null)
        {
            user.ProfilePhotoUrl = dto.ProfilePhotoUrl;
        }

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));
        }
    }

    public async Task ForgotPasswordAsync(ForgotPasswordDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user is null)
        {
            // Do not reveal whether the email exists.
            return;
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);
        var resetLink = $"{_appOptions.FrontendUrl.TrimEnd('/')}/reset-password?email={Uri.EscapeDataString(dto.Email)}&token={encodedToken}";

        await _emailService.SendPasswordResetAsync(user.Email!, resetLink, cancellationToken);
    }

    public async Task ResetPasswordAsync(ResetPasswordDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email)
            ?? throw new InvalidOperationException("Invalid password reset request.");

        var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));
        }
    }

    private async Task NormalizeUserRoleAsync(ApplicationUser user)
    {
        var normalized = SuperAdminPolicy.NormalizeRole(user.Email, user.Role);
        if (normalized == user.Role)
        {
            return;
        }

        user.Role = normalized;
        await _userManager.UpdateAsync(user);
    }

    private AuthResponseDto BuildAuthResponse(ApplicationUser user)
    {
        var (token, expiresAt) = _tokenService.GenerateToken(user);

        return new AuthResponseDto
        {
            Token = token,
            ExpiresAt = expiresAt,
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            DisplayName = user.DisplayName,
            CommentNote = user.CommentNote,
            Role = user.Role,
            NationalId = user.NationalId,
            PhoneNumber = user.PhoneNumber,
            ProfilePhotoUrl = user.ProfilePhotoUrl
        };
    }

    private static bool IsStaffRole(string role) =>
        role is UserRole.Admin or UserRole.Councillor or UserRole.Staff;
}
