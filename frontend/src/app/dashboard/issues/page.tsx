"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { IssueCard } from "@/components/IssueCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { api, ApiError } from "@/lib/api";
import { COUNCILLOR_UPDATE_STATUSES } from "@/lib/constants";
import { SubmitButton } from "@/components/SubmitButton";
import type { IssueDto } from "@/lib/types";
import { IssueStatus } from "@/lib/types";
import { btnPrimaryClass, inputClass, sectionClass, selectClass } from "@/lib/ui";

export default function DashboardIssuesPage() {
  const [issues, setIssues] = useState<IssueDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [status, setStatus] = useState<IssueStatus>(IssueStatus.InProgress);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadIssues = useCallback(async () => {
    try {
      const data = await api.issues.search({ pageSize: 50 });
      setIssues(data);
    } catch {
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIssues();
    const interval = setInterval(loadIssues, 20000);
    const onFocus = () => loadIssues();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadIssues]);

  async function handleStatusUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedIssue || !message.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await api.issues.addStatusUpdate(selectedIssue, status, message.trim());
      setMessage("");
      setSelectedIssue(null);
      await loadIssues();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleArchive(id: string) {
    if (!confirm("Archive this resolved issue?")) return;
    try {
      await api.issues.delete(id);
      await loadIssues();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Archive failed");
    }
  }

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-fg">Live view — updates refresh automatically.</p>

      <form onSubmit={handleStatusUpdate} className={sectionClass}>
        <h2 className="mb-4 font-semibold text-charcoal">Post Status Update</h2>
        {error && (
          <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <div className="grid gap-3 md:grid-cols-3">
          <select value={selectedIssue ?? ""} onChange={(e) => setSelectedIssue(e.target.value || null)} required className={selectClass}>
            <option value="">Select issue…</option>
            {issues.map((issue) => (
              <option key={issue.id} value={issue.id}>
                {issue.referenceNumber ? `#${issue.referenceNumber} — ` : ""}
                {issue.title}
              </option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(Number(e.target.value) as IssueStatus)} className={selectClass}>
            {COUNCILLOR_UPDATE_STATUSES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <input required placeholder="Update message for the citizen" value={message} onChange={(e) => setMessage(e.target.value)} className={inputClass} />
        </div>
        <SubmitButton loading={submitting} loadingText="Posting update…" className={`${btnPrimaryClass} mt-3 w-auto px-6`}>
          Post Update & Notify Citizen
        </SubmitButton>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {issues.map((issue) => (
          <div key={issue.id} className="relative">
            <IssueCard issue={issue} />
            <div className="absolute right-4 top-4 flex gap-2">
              <Link
                href={`/issues/${issue.id}`}
                className="text-xs font-medium text-navy hover:underline"
              >
                View
              </Link>
              {(issue.status === IssueStatus.Resolved ||
                issue.status === IssueStatus.Closed) && (
                <button
                  type="button"
                  onClick={() => handleArchive(issue.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                >
                  <Trash2 className="h-3 w-3" />
                  Archive
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
