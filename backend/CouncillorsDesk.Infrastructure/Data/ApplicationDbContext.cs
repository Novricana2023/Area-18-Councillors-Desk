using CouncillorsDesk.Core.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CouncillorsDesk.Infrastructure.Data;

/// <summary>
/// Primary EF Core database context for Area 18 Councillor's Desk.
/// Extends Identity to use <see cref="ApplicationUser"/> and configures all domain entities.
/// </summary>
public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<IssueReport> IssueReports => Set<IssueReport>();
    public DbSet<IssuePhoto> IssuePhotos => Set<IssuePhoto>();
    public DbSet<IssueUpdate> IssueUpdates => Set<IssueUpdate>();
    public DbSet<IssueComment> IssueComments => Set<IssueComment>();
    public DbSet<CommunityPost> CommunityPosts => Set<CommunityPost>();
    public DbSet<PostComment> PostComments => Set<PostComment>();
    public DbSet<PostLike> PostLikes => Set<PostLike>();
    public DbSet<PostFollow> PostFollows => Set<PostFollow>();
    public DbSet<ContentReport> ContentReports => Set<ContentReport>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<MagazineArticle> MagazineArticles => Set<MagazineArticle>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<AnnouncementComment> AnnouncementComments => Set<AnnouncementComment>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        ConfigureApplicationUser(builder);
        ConfigureIssueReport(builder);
        ConfigureIssuePhoto(builder);
        ConfigureIssueUpdate(builder);
        ConfigureIssueComment(builder);
        ConfigureCommunityPost(builder);
        ConfigurePostComment(builder);
        ConfigurePostLike(builder);
        ConfigurePostFollow(builder);
        ConfigureContentReport(builder);
        ConfigureNotification(builder);
        ConfigureMagazineArticle(builder);
        ConfigureAnnouncement(builder);
        ConfigureAnnouncementComment(builder);
    }

    private static void ConfigureApplicationUser(ModelBuilder builder)
    {
        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(u => u.NationalId).HasMaxLength(20).IsRequired();
            entity.Property(u => u.FullName).HasMaxLength(100).IsRequired();
            entity.Property(u => u.DisplayName).HasMaxLength(50).IsRequired();
            entity.Property(u => u.CommentNote).HasMaxLength(200);
            entity.Property(u => u.Role).HasMaxLength(50).IsRequired();
            entity.Property(u => u.ProfilePhotoUrl).HasMaxLength(500);

            entity.HasIndex(u => u.NationalId).IsUnique();
            entity.HasIndex(u => u.Role);
            entity.HasIndex(u => u.CreatedAt);
        });
    }

    private static void ConfigureIssueReport(ModelBuilder builder)
    {
        builder.Entity<IssueReport>(entity =>
        {
            entity.HasKey(i => i.Id);

            entity.Property(i => i.Title).HasMaxLength(200).IsRequired();
            entity.Property(i => i.Description).HasMaxLength(4000).IsRequired();
            entity.Property(i => i.Location).HasMaxLength(500).IsRequired();
            entity.Property(i => i.ReferenceNumber).HasMaxLength(30);
            entity.Property(i => i.CommentsClosed).HasDefaultValue(false);
            entity.Property(i => i.IsPrivate).HasDefaultValue(false);

            entity.HasOne(i => i.Reporter)
                .WithMany(u => u.ReportedIssues)
                .HasForeignKey(i => i.ReporterId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(i => i.AssignedTo)
                .WithMany(u => u.AssignedIssues)
                .HasForeignKey(i => i.AssignedToId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(i => i.ReferenceNumber).IsUnique();
            entity.HasIndex(i => i.Status);
            entity.HasIndex(i => i.Category);
            entity.HasIndex(i => i.CreatedAt);
            entity.HasIndex(i => i.ReporterId);
            entity.HasIndex(i => i.AssignedToId);
            entity.HasIndex(i => new { i.Status, i.Category });
        });
    }

    private static void ConfigureIssuePhoto(ModelBuilder builder)
    {
        builder.Entity<IssuePhoto>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Url).HasMaxLength(500).IsRequired();
            entity.Property(p => p.Caption).HasMaxLength(200);

            entity.HasOne(p => p.IssueReport)
                .WithMany(i => i.Photos)
                .HasForeignKey(p => p.IssueReportId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(p => p.IssueReportId);
        });
    }

    private static void ConfigureIssueUpdate(ModelBuilder builder)
    {
        builder.Entity<IssueUpdate>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Message).HasMaxLength(2000).IsRequired();

            entity.HasOne(u => u.IssueReport)
                .WithMany(i => i.Updates)
                .HasForeignKey(u => u.IssueReportId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(u => u.UpdatedBy)
                .WithMany(user => user.IssueUpdates)
                .HasForeignKey(u => u.UpdatedById)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(u => u.IssueReportId);
            entity.HasIndex(u => u.CreatedAt);
        });
    }

    private static void ConfigureIssueComment(ModelBuilder builder)
    {
        builder.Entity<IssueComment>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Content).HasMaxLength(4000).IsRequired();

            entity.HasOne(c => c.IssueReport)
                .WithMany(i => i.Comments)
                .HasForeignKey(c => c.IssueReportId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.User)
                .WithMany(u => u.IssueComments)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(c => c.ParentComment)
                .WithMany(c => c.Replies)
                .HasForeignKey(c => c.ParentCommentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(c => c.IssueReportId);
            entity.HasIndex(c => c.ParentCommentId);
            entity.HasIndex(c => c.CreatedAt);
        });
    }

    private static void ConfigureCommunityPost(ModelBuilder builder)
    {
        builder.Entity<CommunityPost>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Title).HasMaxLength(200).IsRequired();
            entity.Property(p => p.Content).HasMaxLength(8000).IsRequired();
            entity.Property(p => p.ImageUrl).HasMaxLength(500);

            entity.HasOne(p => p.Author)
                .WithMany(u => u.CommunityPosts)
                .HasForeignKey(p => p.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(p => p.Category);
            entity.HasIndex(p => p.CreatedAt);
            entity.HasIndex(p => p.IsPinned);
            entity.HasIndex(p => p.IsPublished);
            entity.HasIndex(p => new { p.Category, p.IsPublished, p.CreatedAt });
        });
    }

    private static void ConfigurePostComment(ModelBuilder builder)
    {
        builder.Entity<PostComment>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Content).HasMaxLength(4000).IsRequired();

            entity.HasOne(c => c.Post)
                .WithMany(p => p.Comments)
                .HasForeignKey(c => c.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.User)
                .WithMany(u => u.PostComments)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(c => c.ParentComment)
                .WithMany(c => c.Replies)
                .HasForeignKey(c => c.ParentCommentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(c => c.PostId);
            entity.HasIndex(c => c.ParentCommentId);
            entity.HasIndex(c => c.CreatedAt);
        });
    }

    private static void ConfigurePostLike(ModelBuilder builder)
    {
        builder.Entity<PostLike>(entity =>
        {
            entity.HasKey(l => l.Id);

            entity.HasOne(l => l.Post)
                .WithMany(p => p.Likes)
                .HasForeignKey(l => l.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(l => l.User)
                .WithMany(u => u.PostLikes)
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(l => new { l.PostId, l.UserId }).IsUnique();
        });
    }

    private static void ConfigurePostFollow(ModelBuilder builder)
    {
        builder.Entity<PostFollow>(entity =>
        {
            entity.HasKey(f => f.Id);

            entity.HasOne(f => f.Post)
                .WithMany(p => p.Follows)
                .HasForeignKey(f => f.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(f => f.User)
                .WithMany(u => u.PostFollows)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(f => new { f.PostId, f.UserId }).IsUnique();
        });
    }

    private static void ConfigureContentReport(ModelBuilder builder)
    {
        builder.Entity<ContentReport>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Reason).HasMaxLength(500).IsRequired();
            entity.Property(r => r.Details).HasMaxLength(2000);

            entity.HasOne(r => r.Reporter)
                .WithMany(u => u.ContentReports)
                .HasForeignKey(r => r.ReporterId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(r => r.Status);
            entity.HasIndex(r => new { r.TargetType, r.TargetId });
            entity.HasIndex(r => r.CreatedAt);
        });
    }

    private static void ConfigureNotification(ModelBuilder builder)
    {
        builder.Entity<Notification>(entity =>
        {
            entity.HasKey(n => n.Id);
            entity.Property(n => n.Title).HasMaxLength(200).IsRequired();
            entity.Property(n => n.Message).HasMaxLength(2000).IsRequired();
            entity.Property(n => n.ActionUrl).HasMaxLength(500);

            entity.HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(n => new { n.UserId, n.IsRead });
            entity.HasIndex(n => n.CreatedAt);
        });
    }

    private static void ConfigureMagazineArticle(ModelBuilder builder)
    {
        builder.Entity<MagazineArticle>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Title).HasMaxLength(200).IsRequired();
            entity.Property(a => a.Summary).HasMaxLength(500).IsRequired();
            entity.Property(a => a.Content).IsRequired();
            entity.Property(a => a.CoverImageUrl).HasMaxLength(500);

            entity.HasOne(a => a.Author)
                .WithMany(u => u.MagazineArticles)
                .HasForeignKey(a => a.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(a => a.IsPublished);
            entity.HasIndex(a => a.PublishedAt);
            entity.HasIndex(a => a.CreatedAt);
        });
    }

    private static void ConfigureAnnouncement(ModelBuilder builder)
    {
        builder.Entity<Announcement>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Title).HasMaxLength(200).IsRequired();
            entity.Property(a => a.Content).HasMaxLength(8000).IsRequired();

            entity.HasOne(a => a.Author)
                .WithMany(u => u.Announcements)
                .HasForeignKey(a => a.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(a => a.IsActive);
            entity.HasIndex(a => a.Category);
            entity.HasIndex(a => new { a.EffectiveFrom, a.EffectiveTo });
        });
    }

    private static void ConfigureAnnouncementComment(ModelBuilder builder)
    {
        builder.Entity<AnnouncementComment>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Content).HasMaxLength(4000).IsRequired();

            entity.HasOne(c => c.Announcement)
                .WithMany(a => a.Comments)
                .HasForeignKey(c => c.AnnouncementId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(c => c.ParentComment)
                .WithMany(c => c.Replies)
                .HasForeignKey(c => c.ParentCommentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(c => c.AnnouncementId);
            entity.HasIndex(c => c.ParentCommentId);
        });
    }
}
