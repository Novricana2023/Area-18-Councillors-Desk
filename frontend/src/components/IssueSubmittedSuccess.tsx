"use client";

import Link from "next/link";
import { CheckCircle2, Copy } from "lucide-react";
import { useState } from "react";
import { btnAccentClass, btnPrimaryClass, cardClass } from "@/lib/ui";

interface IssueSubmittedSuccessProps {
  referenceNumber: string;
  issueId: string;
  title: string;
}

export function IssueSubmittedSuccess({ referenceNumber, issueId, title }: IssueSubmittedSuccessProps) {
  const [copied, setCopied] = useState(false);

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={cardClass + " text-center"}>
      <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
      <h2 className="mt-4 text-xl font-semibold text-charcoal">Issue reported successfully</h2>
      <p className="mt-2 text-sm text-muted-fg">
        <span className="font-medium text-charcoal">{title}</span> has been sent to the councillor&apos;s office.
      </p>

      <div className="mx-auto mt-6 max-w-sm rounded-lg border-2 border-dashed border-navy/30 bg-navy/5 px-4 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">Your tracking number</p>
        <p className="mt-2 font-mono text-2xl font-bold text-navy">{referenceNumber}</p>
        <button
          type="button"
          onClick={copyReference}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:underline"
        >
          <Copy className="h-4 w-4" />
          {copied ? "Copied!" : "Copy tracking number"}
        </button>
      </div>

      <p className="mx-auto mt-4 max-w-md text-sm text-muted-fg">
        Save this number. Use it on the Track Issue page to follow progress and councillor updates.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href={`/issues/${issueId}`} className={btnPrimaryClass + " w-auto px-6"}>
          View your issue
        </Link>
        <Link href={`/issues/track?q=${encodeURIComponent(referenceNumber)}`} className={btnAccentClass + " w-auto px-6"}>
          Track issue
        </Link>
      </div>
    </div>
  );
}
