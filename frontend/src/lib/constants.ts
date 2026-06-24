import {
  FeedCategory,
  IssueCategory,
  IssueStatus,
  NotificationType,
} from "./types";

export const AREA_18_CENTER = { lat: -13.983, lng: 33.783 } as const;

export const SITE_NAME = "Councillors Desk – Area 18";
export const SITE_BRAND = "COUNCILLORS DESK";
export const SITE_DESCRIPTION =
  "Civic engagement platform for Area 18, Lilongwe, Malawi — report issues, follow community updates, and track transparency.";

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  [IssueStatus.Submitted]: "Submitted",
  [IssueStatus.UnderReview]: "Reviewed",
  [IssueStatus.Assigned]: "Assigned",
  [IssueStatus.InProgress]: "In Progress",
  [IssueStatus.Resolved]: "Resolved",
  [IssueStatus.Closed]: "Closed",
};

/** Status options councillors use when updating an issue */
export const COUNCILLOR_UPDATE_STATUSES: { value: IssueStatus; label: string }[] = [
  { value: IssueStatus.UnderReview, label: "Reviewed" },
  { value: IssueStatus.InProgress, label: "In Progress" },
  { value: IssueStatus.Resolved, label: "Resolved" },
  { value: IssueStatus.Closed, label: "Closed" },
];

export function isIssueSolved(status: IssueStatus): boolean {
  return status === IssueStatus.Resolved || status === IssueStatus.Closed;
}

export const ISSUE_CATEGORY_LABELS: Record<IssueCategory, string> = {
  [IssueCategory.Roads]: "Roads",
  [IssueCategory.Water]: "Water",
  [IssueCategory.Electricity]: "Electricity",
  [IssueCategory.Security]: "Security",
  [IssueCategory.Sanitation]: "Sanitation",
  [IssueCategory.Health]: "Health",
  [IssueCategory.Education]: "Education",
  [IssueCategory.CommunityServices]: "Community Services",
  [IssueCategory.Other]: "Other",
};

export const FEED_CATEGORY_LABELS: Record<FeedCategory, string> = {
  [FeedCategory.FuneralAnnouncements]: "Funeral Announcements",
  [FeedCategory.SecurityAlerts]: "Security Alerts",
  [FeedCategory.CommunityMeetings]: "Community Meetings",
  [FeedCategory.DevelopmentUpdates]: "Development Updates",
  [FeedCategory.LostAndFound]: "Lost & Found",
  [FeedCategory.PublicNotices]: "Public Notices",
  [FeedCategory.HealthAlerts]: "Health Alerts",
  [FeedCategory.Events]: "Events",
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.StatusUpdate]: "Status Update",
  [NotificationType.NewComment]: "New Comment",
  [NotificationType.CouncillorResponse]: "Councillor Response",
  [NotificationType.Announcement]: "Announcement",
  [NotificationType.IssueAssigned]: "Issue Assigned",
};

export const STATUS_COLORS: Record<IssueStatus, string> = {
  [IssueStatus.Submitted]: "bg-slate-100 text-slate-700",
  [IssueStatus.UnderReview]: "bg-accent-light text-[#b45309]",
  [IssueStatus.Assigned]: "bg-navy/10 text-navy",
  [IssueStatus.InProgress]: "bg-navy/10 text-navy-light",
  [IssueStatus.Resolved]: "bg-emerald-50 text-emerald-800",
  [IssueStatus.Closed]: "bg-slate-100 text-slate-500",
};

export const COUNCILLOR_ROLES = ["Councillor", "Admin", "Staff"];
export const SUPER_ADMIN_EMAIL = "novielungu@gmail.com";

export function isSuperAdminUser(email?: string | null, role?: string | null): boolean {
  return role === "Admin" && email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}
