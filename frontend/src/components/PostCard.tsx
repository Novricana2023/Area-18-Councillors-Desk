"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, MoreHorizontal, Pin, User } from "lucide-react";
import { FEED_CATEGORY_LABELS } from "@/lib/constants";
import type { PostDto } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: PostDto;
  onLike?: (postId: string) => void;
  compact?: boolean;
  sponsored?: boolean;
}

export function PostCard({ post, onLike, compact = false, sponsored = false }: PostCardProps) {
  return (
    <article className={cn("rounded-lg border border-border bg-card", post.isPinned && "ring-1 ring-accent/40")}>
      {/* LinkedIn-style sponsored header */}
      {(sponsored || post.isPinned) && (
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="text-xs font-medium text-muted-fg">
            {post.isPinned ? "Pinned announcement" : "Official notice · Area 18 Ward"}
          </span>
          {post.isPinned && <Pin className="h-3.5 w-3.5 text-accent" />}
        </div>
      )}

      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy/10 text-navy">
              {post.authorPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.authorPhotoUrl} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-charcoal">{post.authorName}</p>
              <p className="text-xs text-muted-fg">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                {" · "}
                {FEED_CATEGORY_LABELS[post.category]}
              </p>
            </div>
          </div>
          <button type="button" className="rounded-md p-1 text-muted-fg hover:bg-muted" aria-label="More options">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        <Link href={`/feed#post-${post.id}`} className="block">
          <h3 className="mb-1.5 text-base font-semibold text-charcoal hover:text-navy">{post.title}</h3>
          <p className={cn("text-sm leading-relaxed text-charcoal/80", compact ? "line-clamp-3" : "line-clamp-5")}>
            {post.content}
          </p>
        </Link>

        {post.imageUrl && !compact && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.imageUrl} alt="" className="mt-3 max-h-72 w-full rounded-md border border-border object-cover" />
        )}
      </div>

      <div className="flex items-center gap-1 border-t border-border px-2 py-1">
        <button
          type="button"
          onClick={() => onLike?.(post.id)}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2.5 text-sm font-medium transition hover:bg-muted",
            post.isLikedByCurrentUser ? "text-accent" : "text-muted-fg hover:text-charcoal",
          )}
        >
          <Heart className={cn("h-4 w-4", post.isLikedByCurrentUser && "fill-current")} />
          {post.likeCount > 0 ? post.likeCount : "Like"}
        </button>
        <span className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2.5 text-sm font-medium text-muted-fg">
          <MessageCircle className="h-4 w-4" />
          {post.commentCount > 0 ? `${post.commentCount} comments` : "Comment"}
        </span>
      </div>
    </article>
  );
}
