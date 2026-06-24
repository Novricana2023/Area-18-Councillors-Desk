"use client";

import { useParams } from "next/navigation";
import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CommentThread } from "@/components/CommentThread";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { FEED_CATEGORY_LABELS } from "@/lib/constants";
import type { AnnouncementDto, AnnouncementCommentDto, IssueCommentDto } from "@/lib/types";
import { sectionClass } from "@/lib/ui";

function mapComments(comments: AnnouncementCommentDto[] = []): IssueCommentDto[] {
  return comments.map((c) => ({
    id: c.id,
    userId: c.userId,
    userName: c.userName,
    userCommentNote: c.userCommentNote,
    userPhotoUrl: null,
    parentCommentId: c.parentCommentId,
    content: c.content,
    isOfficialResponse: false,
    createdAt: c.createdAt,
    replies: mapComments(c.replies),
  }));
}

export default function AnnouncementDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { isAuthenticated } = useAuth();
  const [announcement, setAnnouncement] = useState<AnnouncementDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setAnnouncement(await api.announcements.getById(id));
    } catch {
      setAnnouncement(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await api.announcements.addComment(id, comment.trim());
      setComment("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(parentId: string, content: string) {
    await api.announcements.addReply(id, parentId, content);
    await load();
  }

  if (loading) {
    return <AppShell><LoadingSpinner className="min-h-[50vh]" /></AppShell>;
  }

  if (!announcement) {
    return <AppShell><div className="py-20 text-center text-sm text-muted-fg">Announcement not found.</div></AppShell>;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-8">
        <article className={sectionClass + " mb-8"}>
          <span className="text-xs font-medium text-navy">{FEED_CATEGORY_LABELS[announcement.category]}</span>
          <h1 className="mt-2 text-2xl font-semibold text-charcoal">{announcement.title}</h1>
          <p className="mt-4 whitespace-pre-wrap leading-relaxed text-charcoal/90">{announcement.content}</p>
          <p className="mt-4 text-sm text-muted-fg">
            {announcement.authorName} · Councillor · {format(new Date(announcement.createdAt), "PPP")}
          </p>
        </article>

        <CommentThread
          comments={mapComments(announcement.comments)}
          commentsClosed={false}
          canComment={isAuthenticated}
          isCouncillor={false}
          comment={comment}
          onCommentChange={setComment}
          onSubmit={handleComment}
          onReply={handleReply}
          submitting={submitting}
          error={error}
        />
      </div>
    </AppShell>
  );
}
