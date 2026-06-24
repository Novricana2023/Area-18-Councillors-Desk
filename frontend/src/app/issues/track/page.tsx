"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SubmitButton } from "@/components/SubmitButton";
import { PageHeader } from "@/components/PageHeader";
import { api, ApiError } from "@/lib/api";
import { btnPrimaryClass, cardClass, errorBoxClass, inputClass } from "@/lib/ui";

export default function TrackIssuePage() {
  return (
    <AppShell>
      <Suspense fallback={<LoadingSpinner className="min-h-[40vh]" />}>
        <TrackIssueForm />
      </Suspense>
    </AppShell>
  );
}

function TrackIssueForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setReference(q);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ref = reference.trim().toUpperCase();
    if (!ref) return;

    setLoading(true);
    setError("");
    try {
      const issue = await api.issues.getByReference(ref);
      router.push(`/issues/${issue.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Issue not found. Check your reference number and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <PageHeader
        title="Track an Issue"
        subtitle="Enter your tracking reference (e.g. A18-20260624-0001) to follow progress and join the discussion."
      />

      <form onSubmit={handleSubmit} className={cardClass + " space-y-4"}>
        {error && <p className={errorBoxClass}>{error}</p>}
        <div>
          <label htmlFor="reference" className="mb-1.5 block text-sm font-semibold text-charcoal">
            Reference number
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg" />
            <input
              id="reference"
              required
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="A18-YYYYMMDD-0001"
              className={inputClass + " pl-10 font-mono uppercase"}
            />
          </div>
        </div>
        <SubmitButton loading={loading} loadingText="Looking up…" className={btnPrimaryClass + " w-full"}>
          Track Issue
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-fg">
        You can also browse all public issues on the{" "}
        <Link href="/issues" className="font-medium text-navy underline">
          Community Issues
        </Link>{" "}
        page.
      </p>
    </div>
  );
}
