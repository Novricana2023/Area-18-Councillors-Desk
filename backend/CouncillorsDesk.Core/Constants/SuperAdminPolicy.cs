using CouncillorsDesk.Core.Enums;

namespace CouncillorsDesk.Core.Constants;

/// <summary>
/// Enforces a single Super Admin account for the platform.
/// Only <see cref="Email"/> may hold the Admin role.
/// </summary>
public static class SuperAdminPolicy
{
    public const string Email = "novielungu@gmail.com";

    public static bool IsSuperAdminEmail(string? email) =>
        string.Equals(email?.Trim(), Email, StringComparison.OrdinalIgnoreCase);

    public static bool IsSuperAdmin(string? email, string role) =>
        role == UserRole.Admin && IsSuperAdminEmail(email);

    /// <returns>Corrected role for the given email.</returns>
    public static string NormalizeRole(string? email, string currentRole)
    {
        if (IsSuperAdminEmail(email))
        {
            return UserRole.Admin;
        }

        if (currentRole == UserRole.Admin)
        {
            return UserRole.Resident;
        }

        return currentRole;
    }
}
