using System.ComponentModel.DataAnnotations;

namespace CouncillorsDesk.Core.DTOs.Auth;

public class GoogleAuthDto
{
    [Required]
    public string IdToken { get; set; } = string.Empty;

    /// <summary>citizen or councillor — validates role after sign-in.</summary>
    public string Portal { get; set; } = "citizen";
}
