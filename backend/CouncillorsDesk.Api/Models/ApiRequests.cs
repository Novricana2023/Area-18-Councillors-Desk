using System.ComponentModel.DataAnnotations;
using CouncillorsDesk.Core.Enums;

namespace CouncillorsDesk.Api.Models;

public class AddIssueCommentRequest
{
    [Required]
    [MaxLength(4000)]
    public string Content { get; set; } = string.Empty;

    public bool IsOfficialResponse { get; set; }
}

public class AddIssueStatusUpdateRequest
{
    [Required]
    public IssueStatus Status { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Message { get; set; } = string.Empty;
}

public class ToggleCommentsRequest
{
    public bool Closed { get; set; }
}

public class AddFeedCommentRequest
{
    [Required]
    [MaxLength(4000)]
    public string Content { get; set; } = string.Empty;
}

public class ReportContentRequest
{
    [Required]
    public ContentReportTargetType TargetType { get; set; }

    [Required]
    public Guid TargetId { get; set; }

    [Required]
    [MaxLength(500)]
    public string Reason { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Details { get; set; }
}

public class CreateAnnouncementRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    [Required]
    public FeedCategory Category { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;

    public DateTime? EffectiveTo { get; set; }
}

public class CouncillorDashboardDto
{
    public int TotalIssues { get; set; }
    public int OpenIssues { get; set; }
    public int ResolvedIssues { get; set; }
    public int PrivateIssues { get; set; }
    public int PendingReports { get; set; }
    public int ActiveAnnouncements { get; set; }
    public int TotalResidents { get; set; }
    public int CommunityPosts { get; set; }
    public int UnassignedIssues { get; set; }
    public IReadOnlyList<RecentIssueSummaryDto> RecentIssues { get; set; } = [];
    public IReadOnlyList<RecentIssueSummaryDto> NeedsAttentionIssues { get; set; } = [];
    public IReadOnlyList<RecentIssueSummaryDto> RecentlyResolvedIssues { get; set; } = [];
}

public class RecentIssueSummaryDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public IssueStatus Status { get; set; }
    public IssueCategory Category { get; set; }
    public string? ReferenceNumber { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
}
