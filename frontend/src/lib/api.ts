import Cookies from "js-cookie";
import { IssueStatus } from "./types";
import type {
  AnnouncementDto,
  AnnouncementCommentDto,
  ApiErrorBody,
  ArticleDto,
  AuthResponseDto,
  CommentDto,
  ContentReportDto,
  CreateArticleDto,
  CreateIssueDto,
  CreatePostDto,
  CouncillorDashboardDto,
  ForgotPasswordDto,
  GoogleAuthDto,
  IssueDetailDto,
  IssueDto,
  IssueCommentDto,
  IssueSearchDto,
  IssueUpdateDto,
  LoginDto,
  NotificationDto,
  PostDto,
  RegisterDto,
  ReplyDto,
  ResetPasswordDto,
  TransparencyStatsDto,
  UpdateIssueDto,
  UpdateProfileDto,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const TOKEN_KEY = "auth_token";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: ApiErrorBody,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return Cookies.get(TOKEN_KEY);
}

export function setAuthToken(token: string, expiresAt?: string) {
  const expires = expiresAt ? new Date(expiresAt) : undefined;
  Cookies.set(TOKEN_KEY, token, {
    expires: expires ?? 7,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearAuthToken() {
  Cookies.remove(TOKEN_KEY);
}

export function hasAuthToken(): boolean {
  return !!getToken();
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers = new Headers(options.headers);

  if (auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const hasBody = options.body !== undefined && options.body !== null;
  if (
    hasBody &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  }).catch(() => {
    throw new ApiError(
      0,
      "Cannot reach the server. Make sure the API is running at " + API_BASE,
    );
  });

  if (!response.ok) {
    let body: ApiErrorBody = {};
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = {};
    }
    const message =
      body.detail ??
      body.message ??
      body.title ??
      (response.status === 403
        ? "Access denied. Please use the correct sign-in portal."
        : response.statusText);
    throw new ApiError(response.status, message, body);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

/** ASP.NET JsonStringEnumConverter expects enum names, not numeric values. */
function issueStatusApiName(status: IssueStatus): string {
  return IssueStatus[status] as string;
}

async function downloadBlob(path: string, filename: string): Promise<void> {
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, { headers });
  if (!response.ok) {
    throw new ApiError(response.status, "Download failed");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const api = {
  auth: {
    register: (dto: RegisterDto) =>
      request<AuthResponseDto>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(dto),
      }, false),
    login: (dto: LoginDto) =>
      request<AuthResponseDto>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(dto),
      }, false),
    councillorLogin: (dto: LoginDto) =>
      request<AuthResponseDto>("/api/auth/councillor-login", {
        method: "POST",
        body: JSON.stringify(dto),
      }, false),
    google: (dto: GoogleAuthDto) =>
      request<AuthResponseDto>("/api/auth/google", {
        method: "POST",
        body: JSON.stringify(dto),
      }, false),
    me: () => request<AuthResponseDto>("/api/auth/me"),
    updateProfile: (dto: UpdateProfileDto) =>
      request<AuthResponseDto>("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify(dto),
      }),
    forgotPassword: (dto: ForgotPasswordDto) =>
      request<void>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(dto),
      }, false),
    resetPassword: (dto: ResetPasswordDto) =>
      request<void>("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(dto),
      }, false),
  },

  upload: {
    image: async (file: File, folder = "issues") => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await request<{ url: string }>(
        `/api/upload/image?folder=${encodeURIComponent(folder)}`,
        { method: "POST", body: formData },
      );
      return result.url;
    },
  },

  issues: {
    search: (search: IssueSearchDto) =>
      request<IssueDto[]>(`/api/issues${buildQuery({
        query: search.query,
        category: search.category,
        status: search.status,
        solvedOnly: search.solvedOnly,
        reporterId: search.reporterId,
        assignedToId: search.assignedToId,
        fromDate: search.fromDate,
        toDate: search.toDate,
        page: search.page,
        pageSize: search.pageSize,
      })}`, {}, false),
    getById: (id: string) =>
      request<IssueDetailDto>(`/api/issues/${id}`, {}, false),
    getMyIssues: () => request<IssueDto[]>("/api/issues/my-issues"),
    create: (dto: CreateIssueDto) =>
      request<IssueDetailDto>("/api/issues", {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    update: (id: string, dto: UpdateIssueDto) =>
      request<IssueDetailDto>(`/api/issues/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
      }),
    delete: (id: string) =>
      request<void>(`/api/issues/${id}`, { method: "DELETE" }),
    getByReference: (referenceNumber: string) =>
      request<IssueDetailDto>(`/api/issues/track/${encodeURIComponent(referenceNumber.trim())}`, {}, false),
    addReply: (issueId: string, parentCommentId: string, content: string) =>
      request<IssueCommentDto>(`/api/issues/${issueId}/comments/${parentCommentId}/replies`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    addComment: (id: string, content: string, isOfficialResponse = false) =>
      request<IssueCommentDto>(`/api/issues/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content, isOfficialResponse }),
      }),
    addStatusUpdate: (id: string, newStatus: IssueStatus, message: string) =>
      request<IssueUpdateDto>(`/api/issues/${id}/status-updates`, {
        method: "POST",
        body: JSON.stringify({ status: issueStatusApiName(newStatus), message }),
      }),
    downloadPdf: (id: string, referenceNumber?: string) =>
      downloadBlob(
        `/api/issues/${id}/receipt`,
        `issue-${referenceNumber ?? id}.pdf`,
      ),
    toggleComments: (id: string, closed: boolean) =>
      request<{ commentsClosed: boolean }>(`/api/issues/${id}/comments/toggle`, {
        method: "POST",
        body: JSON.stringify({ closed }),
      }),
  },

  feed: {
    getPosts: (category?: number, page = 1, pageSize = 20) =>
      request<PostDto[]>(`/api/feed/posts${buildQuery({ category, page, pageSize })}`, {}, false),
    getPost: (id: string) =>
      request<PostDto>(`/api/feed/posts/${id}`, {}, false),
    createPost: (dto: CreatePostDto) =>
      request<PostDto>("/api/feed/posts", {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    deletePost: (id: string) =>
      request<void>(`/api/feed/posts/${id}`, { method: "DELETE" }),
    addComment: (postId: string, content: string) =>
      request<CommentDto>(`/api/feed/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    addReply: (postId: string, parentCommentId: string, content: string) =>
      request<ReplyDto>(`/api/feed/posts/${postId}/comments/${parentCommentId}/replies`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    toggleLike: (postId: string) =>
      request<{ liked: boolean }>(`/api/feed/posts/${postId}/like`, { method: "POST" }),
    toggleFollow: (postId: string) =>
      request<{ following: boolean }>(`/api/feed/posts/${postId}/follow`, { method: "POST" }),
    reportContent: (targetType: string, targetId: string, reason: string, details?: string) =>
      request<{ reportId: string }>("/api/feed/report", {
        method: "POST",
        body: JSON.stringify({ targetType, targetId, reason, details }),
      }),
  },

  magazine: {
    getPublished: (page = 1, pageSize = 20) =>
      request<ArticleDto[]>(`/api/magazine${buildQuery({ page, pageSize })}`, {}, false),
    getById: (id: string) =>
      request<ArticleDto>(`/api/magazine/${id}`, {}, false),
    create: (dto: CreateArticleDto) =>
      request<ArticleDto>("/api/magazine", {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    update: (id: string, dto: CreateArticleDto) =>
      request<ArticleDto>(`/api/magazine/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
      }),
    delete: (id: string) =>
      request<void>(`/api/magazine/${id}`, { method: "DELETE" }),
  },

  announcements: {
    getActive: (category?: number) =>
      request<AnnouncementDto[]>(`/api/announcements${buildQuery({ category })}`, {}, false),
    getById: (id: string) =>
      request<AnnouncementDto>(`/api/announcements/${id}`, {}, false),
    create: (dto: Partial<AnnouncementDto>) =>
      request<AnnouncementDto>("/api/announcements", {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    update: (id: string, dto: Partial<AnnouncementDto>) =>
      request<AnnouncementDto>(`/api/announcements/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
      }),
    deactivate: (id: string) =>
      request<void>(`/api/announcements/${id}`, { method: "DELETE" }),
    addComment: (id: string, content: string) =>
      request<AnnouncementCommentDto>(`/api/announcements/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    addReply: (id: string, parentCommentId: string, content: string) =>
      request<AnnouncementCommentDto>(`/api/announcements/${id}/comments/${parentCommentId}/replies`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
  },

  transparency: {
    getStats: (fromDate?: string, toDate?: string) =>
      request<TransparencyStatsDto>(
        `/api/transparency/stats${buildQuery({ fromDate, toDate })}`,
        {},
        false,
      ),
    downloadPdf: () => downloadBlob("/api/transparency/report", "transparency-report.pdf"),
  },

  dashboard: {
    getStats: () => request<CouncillorDashboardDto>("/api/dashboard/stats"),
  },

  notifications: {
    getAll: (unreadOnly = false, page = 1, pageSize = 20) =>
      request<NotificationDto[]>(
        `/api/notifications${buildQuery({ unreadOnly, page, pageSize })}`,
      ),
    getUnreadCount: () =>
      request<{ count: number }>("/api/notifications/unread-count"),
    markAsRead: (id: string) =>
      request<void>(`/api/notifications/${id}/read`, { method: "PUT" }),
    markAllAsRead: () =>
      request<void>("/api/notifications/read-all", { method: "PUT" }),
  },

  moderation: {
    getReports: (page = 1, pageSize = 20) =>
      request<ContentReportDto[]>(
        `/api/moderation/reports${buildQuery({ page, pageSize })}`,
      ),
    reviewReport: (id: string, status: string) =>
      request<void>(`/api/moderation/reports/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
  },
};
