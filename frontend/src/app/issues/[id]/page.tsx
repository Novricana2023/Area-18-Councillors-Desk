"use client";

import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { Download, Lock, LockOpen, MapPin, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CommentThread } from "@/components/CommentThread";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { ISSUE_CATEGORY_LABELS, ISSUE_STATUS_LABELS, COUNCILLOR_UPDATE_STATUSES, STATUS_COLORS } from "@/lib/constants";
import type { IssueDetailDto } from "@/lib/types";
import { IssueStatus } from "@/lib/types";
import { btnPrimaryClass, btnSecondaryClass, sectionClass, selectClass, textareaClass, errorBoxClass } from "@/lib/ui";
import { PhotoGallery } from "@/components/PhotoGallery";
import { SubmitButton, LoadingButton } from "@/components/SubmitButton";
import { cn } from "@/lib/utils";

const AreaMap = dynamic(() => import("@/components/AreaMap").then((m) => m.AreaMap), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse rounded-lg bg-muted" />,
});

const LIVE_REFRESH_MS = 10000;

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isAuthenticated, isCouncillor, user } = useAuth();
  const [issue, setIssue] = useState<IssueDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [newStatus, setNewStatus] = useState<IssueStatus>(IssueStatus.UnderReview);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusSuccess, setStatusSuccess] = useState("");
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [togglingComments, setTogglingComments] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadIssue = useCallback(async (silent = false) => {
    try {
      setIssue(await api.issues.getById(id));
    } catch {
      if (!silent) setIssue(null);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadIssue(false);
    const interval = setInterval(() => loadIssue(true), LIVE_REFRESH_MS);
    return () => clearInterval(interval);
  }, [loadIssue]);

  useEffect(() => {
    if (issue) {
      setNewStatus(issue.status);
    }
  }, [issue?.status]);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    setCommentError("");
    try {
      await api.issues.addComment(id, comment.trim(), isCouncillor);
      setComment("");
      await loadIssue();
    } catch (err) {
      setCommentError(err instanceof ApiError ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(parentId: string, content: string) {
    setCommentError("");
    try {
      await api.issues.addReply(id, parentId, content);
      await loadIssue();
    } catch (err) {
      setCommentError(err instanceof ApiError ? err.message : "Failed to post reply");
      throw err;
    }
  }

  async function handleDownloadPdf() {
    setDownloadingPdf(true);
    setCommentError("");
    try {
      await api.issues.downloadPdf(id, issue?.referenceNumber ?? undefined);
    } catch {
      setCommentError("PDF download failed");
    } finally {
      setDownloadingPdf(false);
    }
  }

  async function handleToggleComments() {
    if (!issue) return;
    setTogglingComments(true);
    setCommentError("");
    try {
      await api.issues.toggleComments(id, !issue.commentsClosed);
      await loadIssue(true);
    } catch (err) {
      setCommentError(err instanceof ApiError ? err.message : "Failed to update comments");
    } finally {
      setTogglingComments(false);
    }
  }

  async function handleDelete() {
    if (!issue || !confirm("Delete this issue permanently? This cannot be undone.")) return;
    setDeleting(true);
    setCommentError("");
    try {
      await api.issues.delete(id);
      router.push(isCouncillor ? "/dashboard/issues" : "/issues");
    } catch (err) {
      setCommentError(err instanceof ApiError ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  async function handleStatusUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!statusMessage.trim()) return;
    setUpdatingStatus(true);
    setStatusError("");
    setStatusSuccess("");
    try {
      await api.issues.addStatusUpdate(id, newStatus, statusMessage.trim());
      setStatusMessage("");
      setStatusSuccess("Update posted — the citizen can see it on the timeline below.");
      await loadIssue();
    } catch (err) {
      setStatusError(err instanceof ApiError ? err.message : "Status update failed");
    } finally {
      setUpdatingStatus(false);
    }
  }

  const isReporter = user?.userId === issue?.reporterId;
  const daysSinceReport = issue
    ? (Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    : 999;
  const canDelete = issue && (isCouncillor || (isReporter && daysSinceReport <= 5));
  const canComment = isAuthenticated && (!issue?.commentsClosed || isCouncillor);

  if (loading) {
    return <AppShell><LoadingSpinner className="min-h-[50vh]" /></AppShell>;
  }

  if (!issue) {
    return <AppShell><div className="py-20 text-center text-sm text-muted-fg">Issue not found.</div></AppShell>;
  }

  const hasCoords = issue.latitude != null && issue.longitude != null;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-fg">
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-green-500" />
          Live updates every {LIVE_REFRESH_MS / 1000}s
        </div>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            {issue.referenceNumber && (
              <p className="mb-1 font-mono text-sm text-muted-fg">#{issue.referenceNumber}</p>
            )}
            <h1 className="text-2xl font-semibold text-charcoal">{issue.title}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={cn("rounded-md px-2.5 py-1 text-xs font-medium", STATUS_COLORS[issue.status])}>
              {ISSUE_STATUS_LABELS[issue.status]}
            </span>
            <LoadingButton
              loading={downloadingPdf}
              loadingText="Preparing PDF…"
              onClick={handleDownloadPdf}
              className={btnSecondaryClass + " gap-2 py-2"}
            >
              <Download className="h-4 w-4" /> PDF
            </LoadingButton>
            {isCouncillor && (
              <LoadingButton
                loading={togglingComments}
                loadingText="Updating…"
                onClick={handleToggleComments}
                className={btnSecondaryClass + " gap-2 py-2"}
              >
                {issue.commentsClosed ? <><LockOpen className="h-4 w-4" /> Open Comments</> : <><Lock className="h-4 w-4" /> Close Comments</>}
              </LoadingButton>
            )}
            {canDelete && (
              <LoadingButton
                loading={deleting}
                loadingText="Deleting…"
                onClick={handleDelete}
                className={btnSecondaryClass + " gap-2 border-red-200 py-2 text-red-700 hover:bg-red-50"}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </LoadingButton>
            )}
          </div>
        </div>

        <div className={sectionClass + " mb-8"}>
          <p className="leading-relaxed text-charcoal/90">{issue.description}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-fg">
            <span className="rounded bg-muted px-2 py-0.5 font-medium text-charcoal">{ISSUE_CATEGORY_LABELS[issue.category]}</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{issue.location}</span>
            <span>Reported by {issue.reporterName}</span>
            <span>{format(new Date(issue.createdAt), "PPP")}</span>
          </div>
          {hasCoords && (
            <div className="mt-4">
              <AreaMap
                center={{ lat: issue.latitude!, lng: issue.longitude! }}
                issues={[issue]}
                height="h-48"
              />
            </div>
          )}
          {issue.photoUrls.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-charcoal">Photos ({issue.photoUrls.length})</h3>
              <PhotoGallery urls={issue.photoUrls} title={issue.title} />
            </div>
          )}
        </div>

        {isCouncillor && (
          <form onSubmit={handleStatusUpdate} className={sectionClass + " mb-8 space-y-3"}>
            <h2 className="text-base font-semibold text-charcoal">Councillor Status Update</h2>
            <p className="text-sm text-muted-fg">Mark as reviewed, in progress, or closed — residents are notified automatically.</p>
            {statusError && <p className={errorBoxClass}>{statusError}</p>}
            {statusSuccess && (
              <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{statusSuccess}</p>
            )}
            <textarea
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              rows={3}
              placeholder="Explain the update, delay, or next steps for the community…"
              className={textareaClass}
              required
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <select value={newStatus} onChange={(e) => setNewStatus(Number(e.target.value) as IssueStatus)} className={selectClass}>
                {COUNCILLOR_UPDATE_STATUSES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <SubmitButton
                loading={updatingStatus}
                loadingText="Posting update…"
                disabled={!statusMessage.trim()}
                className={btnPrimaryClass}
              >
                Post Update
              </SubmitButton>
            </div>
          </form>
        )}

        <section className="mb-8">
          <h2 className="mb-4 text-base font-semibold text-charcoal">Status Timeline</h2>
          {issue.updates.length === 0 ? (
            <p className="text-sm text-muted-fg">No status updates yet.</p>
          ) : (
            <ol className="relative space-y-4 border-l border-border pl-6">
              {issue.updates.map((update) => (
                <li key={update.id} className="relative">
                  <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full bg-navy ring-4 ring-white" />
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="font-medium text-charcoal">{ISSUE_STATUS_LABELS[update.newStatus]}</p>
                    <p className="mt-1 text-sm text-muted-fg">{update.message}</p>
                    <p className="mt-2 text-xs text-muted-fg">{update.updatedByName} · {format(new Date(update.createdAt), "PPp")}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <CommentThread
          comments={issue.comments}
          commentsClosed={issue.commentsClosed ?? false}
          canComment={!!canComment}
          isCouncillor={isCouncillor}
          comment={comment}
          onCommentChange={setComment}
          onSubmit={handleComment}
          onReply={handleReply}
          submitting={submitting}
          error={commentError}
        />
      </div>
    </AppShell>
  );
}
