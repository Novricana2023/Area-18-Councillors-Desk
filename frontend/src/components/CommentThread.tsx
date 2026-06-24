"use client";

import { format, formatDistanceToNow } from "date-fns";
import { Lock, MessageSquare, Reply, Shield } from "lucide-react";
import { useState } from "react";
import { btnAccentClass, btnPrimaryClass, btnSecondaryClass, textareaClass } from "@/lib/ui";
import { LoadingButton } from "@/components/SubmitButton";
import { cn } from "@/lib/utils";
import type { IssueCommentDto } from "@/lib/types";

interface CommentThreadProps {
  comments: IssueCommentDto[];
  commentsClosed: boolean;
  issueSolved?: boolean;
  canComment: boolean;
  isCouncillor: boolean;
  comment: string;
  onCommentChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReply: (parentId: string, content: string) => Promise<void>;
  submitting: boolean;
  error?: string;
}

function countComments(items: IssueCommentDto[]): number {
  return items.reduce((sum, c) => sum + 1 + countComments(c.replies ?? []), 0);
}

function CommentAvatar({ name, isOfficial }: { name: string; isOfficial?: boolean }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
        isOfficial ? "bg-navy text-white" : "bg-muted text-navy",
      )}
    >
      {isOfficial ? <Shield className="h-3.5 w-3.5" /> : initial}
    </div>
  );
}

function CommentItem({
  comment,
  depth,
  canComment,
  isCouncillor,
  onReply,
}: {
  comment: IssueCommentDto;
  depth: number;
  canComment: boolean;
  isCouncillor: boolean;
  onReply: (parentId: string, content: string) => Promise<void>;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      await onReply(comment.id, replyText.trim());
      setReplyText("");
      setReplyOpen(false);
    } finally {
      setReplying(false);
    }
  }

  return (
    <article className={cn(depth > 0 && "ml-8 border-l-2 border-navy/10 pl-4")}>
      <div className="flex gap-3 py-3">
        <CommentAvatar name={comment.userName} isOfficial={comment.isOfficialResponse} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-sm font-semibold text-charcoal">{comment.userName}</span>
            {comment.isOfficialResponse && (
              <span className="rounded bg-navy px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                Councillor
              </span>
            )}
            {comment.userCommentNote && (
              <span className="text-xs text-muted-fg">· {comment.userCommentNote}</span>
            )}
            <time className="text-xs text-muted-fg" title={format(new Date(comment.createdAt), "PPpp")}>
              · {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </time>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-charcoal/90">{comment.content}</p>
          {canComment && (
            <button
              type="button"
              onClick={() => setReplyOpen((v) => !v)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-navy hover:underline"
            >
              <Reply className="h-3 w-3" />
              Reply
            </button>
          )}
        </div>
      </div>

      {replyOpen && (
        <form onSubmit={handleReply} className="mb-3 ml-12 space-y-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={2}
            placeholder={isCouncillor ? "Write a councillor reply…" : "Write a reply…"}
            className={textareaClass}
            autoFocus
          />
          <div className="flex gap-2">
            <LoadingButton
              type="submit"
              loading={replying}
              loadingText="Posting…"
              disabled={!replyText.trim()}
              className={btnAccentClass + " py-2 text-xs"}
            >
              Post Reply
            </LoadingButton>
            <button type="button" onClick={() => setReplyOpen(false)} className={btnSecondaryClass + " py-2 text-xs"}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {(comment.replies ?? []).map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          depth={depth + 1}
          canComment={canComment}
          isCouncillor={isCouncillor}
          onReply={onReply}
        />
      ))}
    </article>
  );
}

export function CommentThread({
  comments,
  commentsClosed,
  issueSolved = false,
  canComment,
  isCouncillor,
  comment,
  onCommentChange,
  onSubmit,
  onReply,
  submitting,
  error,
}: CommentThreadProps) {
  const total = countComments(comments);

  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-charcoal">
          <MessageSquare className="h-4 w-4 text-navy" />
          Discussion
          <span className="font-normal text-muted-fg">({total})</span>
        </h2>
        {commentsClosed && (
          <span className="inline-flex items-center gap-1 rounded-md bg-accent-light px-2.5 py-1 text-xs font-medium text-[#b45309]">
            <Lock className="h-3 w-3" />
            Closed
          </span>
        )}
      </div>

      <div className="divide-y divide-border px-5">
        {comments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-fg">
            No comments yet. Sign in and share your thoughts — everyone can join the discussion on public issues.
          </p>
        ) : (
          comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              depth={0}
              canComment={canComment}
              isCouncillor={isCouncillor}
              onReply={onReply}
            />
          ))
        )}
      </div>

      {canComment ? (
        <form onSubmit={onSubmit} className="border-t border-border bg-muted/50 p-5">
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          <textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            rows={3}
            placeholder={
              isCouncillor
                ? "Post an official update or ask the citizen for more information…"
                : "Ask a follow-up question or share an update…"
            }
            className={textareaClass}
          />
          <div className="mt-3 flex justify-end">
            <LoadingButton
              type="submit"
              loading={submitting}
              loadingText="Posting…"
              disabled={!comment.trim()}
              className={isCouncillor ? btnPrimaryClass : btnAccentClass}
            >
              {isCouncillor ? "Post Official Response" : "Post Comment"}
            </LoadingButton>
          </div>
        </form>
      ) : commentsClosed ? (
        <p className="border-t border-border px-5 py-4 text-sm text-muted-fg">
          Comments are closed on this issue. The councillor has locked this discussion.
        </p>
      ) : (
        <p className="border-t border-border px-5 py-4 text-sm text-muted-fg">
          Sign in to join the discussion and reply to updates.
        </p>
      )}
    </section>
  );
}
