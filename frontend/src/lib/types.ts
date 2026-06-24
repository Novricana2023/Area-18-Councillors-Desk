export enum IssueStatus {
  Submitted = 0,
  UnderReview = 1,
  Assigned = 2,
  InProgress = 3,
  Resolved = 4,
  Closed = 5,
}

export enum IssueCategory {
  Roads = 0,
  Water = 1,
  Electricity = 2,
  Security = 3,
  Sanitation = 4,
  Health = 5,
  Education = 6,
  CommunityServices = 7,
  Other = 8,
}

export enum FeedCategory {
  FuneralAnnouncements = 0,
  SecurityAlerts = 1,
  CommunityMeetings = 2,
  DevelopmentUpdates = 3,
  LostAndFound = 4,
  PublicNotices = 5,
  HealthAlerts = 6,
  Events = 7,
}

export enum NotificationType {
  StatusUpdate = 0,
  NewComment = 1,
  CouncillorResponse = 2,
  Announcement = 3,
  IssueAssigned = 4,
}

export const UserRole = {
  Resident: "Resident",
  Councillor: "Councillor",
  Admin: "Admin",
  Staff: "Staff",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export interface AuthResponseDto {
  token: string;
  expiresAt: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
  nationalId?: string | null;
  phoneNumber?: string | null;
  displayName?: string | null;
  commentNote?: string | null;
  profilePhotoUrl?: string | null;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  displayName: string;
  commentNote?: string | null;
  nationalId: string;
  phoneNumber?: string | null;
  agreedToTerms: boolean;
}

export interface GoogleAuthDto {
  idToken: string;
  portal?: "citizen" | "councillor";
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  token: string;
  newPassword: string;
}

export interface UpdateProfileDto {
  fullName?: string | null;
  displayName?: string | null;
  commentNote?: string | null;
  phoneNumber?: string | null;
  profilePhotoUrl?: string | null;
}

export interface IssueDto {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  referenceNumber?: string | null;
  reporterName: string;
  assignedToName?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  resolvedAt?: string | null;
  photoCount: number;
  coverPhotoUrl?: string | null;
  commentCount: number;
  commentsClosed?: boolean;
}

export interface IssueUpdateDto {
  id: string;
  previousStatus?: IssueStatus | null;
  newStatus: IssueStatus;
  message: string;
  updatedByName: string;
  createdAt: string;
}

export interface IssueCommentDto {
  id: string;
  userId: string;
  userName: string;
  userCommentNote?: string | null;
  userPhotoUrl?: string | null;
  parentCommentId?: string | null;
  content: string;
  isOfficialResponse: boolean;
  createdAt: string;
  replies?: IssueCommentDto[];
}

export interface IssueDetailDto extends IssueDto {
  reporterId: string;
  assignedToId?: string | null;
  photoUrls: string[];
  updates: IssueUpdateDto[];
  comments: IssueCommentDto[];
}

export interface IssueSearchDto {
  query?: string | null;
  category?: IssueCategory | null;
  status?: IssueStatus | null;
  solvedOnly?: boolean | null;
  reporterId?: string | null;
  assignedToId?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  page?: number;
  pageSize?: number;
}

export interface CreateIssueDto {
  title: string;
  description: string;
  category: IssueCategory;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  photoUrls?: string[] | null;
  isPrivate?: boolean;
}

export interface UpdateIssueDto {
  title?: string | null;
  description?: string | null;
  category?: IssueCategory | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status?: IssueStatus | null;
  assignedToId?: string | null;
}

export interface ReplyDto {
  id: string;
  userId: string;
  userName: string;
  userPhotoUrl?: string | null;
  content: string;
  createdAt: string;
}

export interface CommentDto {
  id: string;
  userId: string;
  userName: string;
  userPhotoUrl?: string | null;
  content: string;
  createdAt: string;
  replies: ReplyDto[];
}

export interface PostDto {
  id: string;
  category: FeedCategory;
  title: string;
  content: string;
  imageUrl?: string | null;
  isPinned: boolean;
  authorId: string;
  authorName: string;
  authorPhotoUrl?: string | null;
  likeCount: number;
  commentCount: number;
  followCount: number;
  isLikedByCurrentUser: boolean;
  isFollowedByCurrentUser: boolean;
  createdAt: string;
  updatedAt?: string | null;
  comments: CommentDto[];
}

export interface CreatePostDto {
  category: FeedCategory;
  title: string;
  content: string;
  imageUrl?: string | null;
}

export interface ArticleDto {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImageUrl?: string | null;
  isPublished: boolean;
  authorId: string;
  authorName: string;
  createdAt: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateArticleDto {
  title: string;
  summary: string;
  content: string;
  coverImageUrl?: string | null;
  isPublished: boolean;
}

export interface AnnouncementCommentDto {
  id: string;
  userId: string;
  userName: string;
  userCommentNote?: string | null;
  parentCommentId?: string | null;
  content: string;
  createdAt: string;
  replies?: AnnouncementCommentDto[];
}

export interface AnnouncementDto {
  id: string;
  title: string;
  content: string;
  category: FeedCategory;
  isActive: boolean;
  authorId: string;
  authorName: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  createdAt: string;
  comments?: AnnouncementCommentDto[];
}

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityId?: string | null;
  actionUrl?: string | null;
  createdAt: string;
  readAt?: string | null;
}

export interface MonthlyIssueStatsDto {
  year: number;
  month: number;
  submitted: number;
  resolved: number;
}

export interface TransparencyStatsDto {
  totalIssues: number;
  resolvedIssues: number;
  openIssues: number;
  resolutionRate: number;
  averageResolutionDays: number;
  issuesByCategory: Record<string, number>;
  issuesByStatus: Record<string, number>;
  monthlyTrend: MonthlyIssueStatsDto[];
}

export interface RecentIssueSummaryDto {
  id: string;
  title: string;
  status: IssueStatus;
  category: IssueCategory;
  referenceNumber?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface CouncillorDashboardDto {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  privateIssues: number;
  pendingReports: number;
  activeAnnouncements: number;
  totalResidents: number;
  communityPosts: number;
  unassignedIssues: number;
  recentIssues: RecentIssueSummaryDto[];
  needsAttentionIssues: RecentIssueSummaryDto[];
  recentlyResolvedIssues: RecentIssueSummaryDto[];
}

export interface ContentReportDto {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: string;
  targetId: string;
  reason: string;
  details?: string | null;
  status: string;
  createdAt: string;
  reviewedAt?: string | null;
}

export interface ApiErrorBody {
  message?: string;
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}
