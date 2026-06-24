using System.ComponentModel.DataAnnotations;

namespace CouncillorsDesk.Core.DTOs.Auth;

public class RegisterDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;

    public bool AgreedToTerms { get; set; }

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string DisplayName { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? CommentNote { get; set; }

    [Required]
    [MaxLength(20)]
    public string NationalId { get; set; } = string.Empty;

    [Phone]
    public string? PhoneNumber { get; set; }
}
