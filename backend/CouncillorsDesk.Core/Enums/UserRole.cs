namespace CouncillorsDesk.Core.Enums;

public static class UserRole
{
    public const string Resident = "Resident";
    public const string Councillor = "Councillor";
    public const string Admin = "Admin";
    public const string Staff = "Staff";

    public static readonly IReadOnlyList<string> All =
    [
        Resident,
        Councillor,
        Admin,
        Staff
    ];
}
