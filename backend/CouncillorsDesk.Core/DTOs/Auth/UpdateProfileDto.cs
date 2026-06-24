using System.ComponentModel.DataAnnotations;

namespace CouncillorsDesk.Core.DTOs.Auth;

public class UpdateProfileDto
{
    [MaxLength(100)]
    public string? FullName { get; set; }

    [MaxLength(50)]
    public string? DisplayName { get; set; }

    [MaxLength(200)]
    public string? CommentNote { get; set; }

    [Phone]
    public string? PhoneNumber { get; set; }

    public string? ProfilePhotoUrl { get; set; }
}
