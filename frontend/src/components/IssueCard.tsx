import Link from "next/link";

import { formatDistanceToNow } from "date-fns";

import { Camera, MapPin, MessageCircle } from "lucide-react";

import { ISSUE_CATEGORY_LABELS, ISSUE_STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";

import { resolveMediaUrl } from "@/lib/media";

import type { IssueDto } from "@/lib/types";

import { cn } from "@/lib/utils";



export function IssueCard({ issue }: { issue: IssueDto }) {

  const cover = issue.coverPhotoUrl ? resolveMediaUrl(issue.coverPhotoUrl) : null;



  return (

    <Link

      href={`/issues/${issue.id}`}

      className="group block overflow-hidden rounded-lg border border-border bg-card transition hover:border-navy/30 hover:shadow-sm"

    >

      {cover && (

        // eslint-disable-next-line @next/next/no-img-element

        <img

          src={cover}

          alt=""

          className="aspect-[16/9] w-full border-b border-border object-cover"

          loading="lazy"

        />

      )}

      <div className="p-5">

        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">

          <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", STATUS_COLORS[issue.status])}>

            {ISSUE_STATUS_LABELS[issue.status]}

          </span>

          {issue.referenceNumber && (

            <span className="font-mono text-xs text-muted-fg">#{issue.referenceNumber}</span>

          )}

        </div>

        <h3 className="mb-2 text-base font-semibold text-charcoal group-hover:text-navy">

          {issue.title}

        </h3>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-fg">{issue.description}</p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-fg">

          <span className="rounded bg-muted px-2 py-0.5 font-medium text-charcoal">

            {ISSUE_CATEGORY_LABELS[issue.category]}

          </span>

          <span className="inline-flex items-center gap-1">

            <MapPin className="h-3.5 w-3.5" />

            {issue.location}

          </span>

          {issue.photoCount > 0 && (

            <span className="inline-flex items-center gap-1">

              <Camera className="h-3.5 w-3.5" />

              {issue.photoCount}

            </span>

          )}

          {issue.commentCount > 0 && (

            <span className="inline-flex items-center gap-1">

              <MessageCircle className="h-3.5 w-3.5" />

              {issue.commentCount}

            </span>

          )}

          <span className="ml-auto">{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</span>

        </div>

      </div>

    </Link>

  );

}

