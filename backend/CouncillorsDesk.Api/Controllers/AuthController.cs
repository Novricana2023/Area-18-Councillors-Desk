using CouncillorsDesk.Api.Extensions;
using CouncillorsDesk.Core.DTOs.Auth;
using CouncillorsDesk.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CouncillorsDesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Register(
        [FromBody] RegisterDto dto,
        CancellationToken cancellationToken)
    {
        var result = await _authService.RegisterAsync(dto, cancellationToken);
        return Ok(result);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> CitizenLogin(
        [FromBody] LoginDto dto,
        CancellationToken cancellationToken)
    {
        var result = await _authService.CitizenLoginAsync(dto, cancellationToken);
        return Ok(result);
    }

    [HttpPost("councillor-login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> CouncillorLogin(
        [FromBody] LoginDto dto,
        CancellationToken cancellationToken)
    {
        var result = await _authService.CouncillorLoginAsync(dto, cancellationToken);
        return Ok(result);
    }

    [HttpPost("google")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> GoogleAuth(
        [FromBody] GoogleAuthDto dto,
        CancellationToken cancellationToken)
    {
        var result = await _authService.GoogleAuthAsync(dto, cancellationToken);
        return Ok(result);
    }

    [HttpGet("me")]
    [HttpGet("profile")]
    [Authorize]
    public async Task<ActionResult<AuthResponseDto>> GetProfile(CancellationToken cancellationToken)
    {
        var user = await _authService.GetCurrentUserAsync(User.GetUserId(), cancellationToken);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateProfileDto dto,
        CancellationToken cancellationToken)
    {
        await _authService.UpdateProfileAsync(User.GetUserId(), dto, cancellationToken);
        var user = await _authService.GetCurrentUserAsync(User.GetUserId(), cancellationToken);
        return Ok(user);
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword(
        [FromBody] ForgotPasswordDto dto,
        CancellationToken cancellationToken)
    {
        await _authService.ForgotPasswordAsync(dto, cancellationToken);
        return Ok(new { message = "If an account exists for that email, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordDto dto,
        CancellationToken cancellationToken)
    {
        await _authService.ResetPasswordAsync(dto, cancellationToken);
        return Ok(new { message = "Password has been reset successfully." });
    }
}
