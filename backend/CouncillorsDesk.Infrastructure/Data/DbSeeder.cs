using CouncillorsDesk.Core.Constants;
using CouncillorsDesk.Core.Entities;
using CouncillorsDesk.Core.Enums;
using CouncillorsDesk.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CouncillorsDesk.Infrastructure.Data;

/// <summary>
/// Applies migrations and ensures the Super Admin account exists.
/// No demo users, sample issues, or placeholder content are seeded.
/// </summary>
public class DbSeeder
{
    private static readonly string[] DemoEmails =
    [
        "citizen@area18.mw",
        "admin@area18.mw"
    ];

    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<DbSeeder> _logger;

    public DbSeeder(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        ILogger<DbSeeder> logger)
    {
        _context = context;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await _context.Database.MigrateAsync(cancellationToken);

        await EnsureSuperAdminAsync(cancellationToken);
        await PurgeDemoPlaceholderContentAsync(cancellationToken);
    }

    private async Task EnsureSuperAdminAsync(CancellationToken cancellationToken)
    {
        var users = await _userManager.Users.ToListAsync(cancellationToken);
        foreach (var user in users)
        {
            var normalized = SuperAdminPolicy.NormalizeRole(user.Email, user.Role);
            if (normalized != user.Role)
            {
                user.Role = normalized;
                await _userManager.UpdateAsync(user);
                _logger.LogWarning("Adjusted role for {Email} to {Role}", user.Email, normalized);
            }
        }

        var superAdmin = await _userManager.FindByEmailAsync(SuperAdminPolicy.Email);
        if (superAdmin is not null)
        {
            return;
        }

        _logger.LogInformation("Creating Super Admin account for {Email}", SuperAdminPolicy.Email);

        var password = Environment.GetEnvironmentVariable("SUPER_ADMIN_PASSWORD");
        if (string.IsNullOrWhiteSpace(password))
        {
            _logger.LogWarning(
                "SUPER_ADMIN_PASSWORD is not set. Skipping Super Admin account creation. " +
                "Set the environment variable or use: dotnet user-secrets set \"SUPER_ADMIN_PASSWORD\" \"your-password\"");
            return;
        }

        await CreateUserAsync(
            email: SuperAdminPolicy.Email,
            password: password,
            fullName: "Super Admin",
            nationalId: "A18-SUPER-ADMIN",
            phoneNumber: "+265991000000",
            role: UserRole.Admin,
            commentNote: "Platform Super Admin",
            cancellationToken);
    }

    /// <summary>
    /// Removes legacy demo accounts and all placeholder feed/magazine/sample issue content.
    /// </summary>
    private async Task PurgeDemoPlaceholderContentAsync(CancellationToken cancellationToken)
    {
        var demoUsers = await _userManager.Users
            .Where(u => u.Email != null && (u.Email.ToLower() == "citizen@area18.mw" || u.Email.ToLower() == "admin@area18.mw"))
            .ToListAsync(cancellationToken);

        if (demoUsers.Count == 0
            && !await _context.CommunityPosts.AnyAsync(cancellationToken)
            && !await _context.MagazineArticles.AnyAsync(cancellationToken))
        {
            return;
        }

        _logger.LogInformation("Removing demo placeholder content from database…");

        _context.PostLikes.RemoveRange(await _context.PostLikes.ToListAsync(cancellationToken));
        _context.PostComments.RemoveRange(await _context.PostComments.ToListAsync(cancellationToken));
        _context.PostFollows.RemoveRange(await _context.PostFollows.ToListAsync(cancellationToken));
        _context.CommunityPosts.RemoveRange(await _context.CommunityPosts.ToListAsync(cancellationToken));
        _context.MagazineArticles.RemoveRange(await _context.MagazineArticles.ToListAsync(cancellationToken));

        foreach (var demoUser in demoUsers)
        {
            var issueIds = await _context.IssueReports
                .Where(i => i.ReporterId == demoUser.Id || i.AssignedToId == demoUser.Id)
                .Select(i => i.Id)
                .ToListAsync(cancellationToken);

            if (issueIds.Count > 0)
            {
                _context.IssueComments.RemoveRange(
                    await _context.IssueComments.Where(c => issueIds.Contains(c.IssueReportId)).ToListAsync(cancellationToken));
                _context.IssueUpdates.RemoveRange(
                    await _context.IssueUpdates.Where(u => issueIds.Contains(u.IssueReportId)).ToListAsync(cancellationToken));
                _context.IssuePhotos.RemoveRange(
                    await _context.IssuePhotos.Where(p => issueIds.Contains(p.IssueReportId)).ToListAsync(cancellationToken));
                _context.IssueReports.RemoveRange(
                    await _context.IssueReports.Where(i => issueIds.Contains(i.Id)).ToListAsync(cancellationToken));
            }

            _context.Announcements.RemoveRange(
                await _context.Announcements.Where(a => a.AuthorId == demoUser.Id).ToListAsync(cancellationToken));

            await _userManager.DeleteAsync(demoUser);
            _logger.LogInformation("Removed demo user {Email}", demoUser.Email);
        }

        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Demo placeholder content removed.");
    }

    private async Task<ApplicationUser> CreateUserAsync(
        string email,
        string password,
        string fullName,
        string nationalId,
        string phoneNumber,
        string role,
        string commentNote,
        CancellationToken cancellationToken)
    {
        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            FullName = fullName,
            DisplayName = fullName.Split(' ')[0],
            CommentNote = commentNote,
            NationalId = nationalId,
            PhoneNumber = phoneNumber,
            Role = role,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to create user {email}: {errors}");
        }

        return user;
    }
}
