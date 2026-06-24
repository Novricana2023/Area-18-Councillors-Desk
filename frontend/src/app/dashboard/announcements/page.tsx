"use client";

import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { api, ApiError } from "@/lib/api";
import { FEED_CATEGORY_LABELS } from "@/lib/constants";
import type { AnnouncementDto } from "@/lib/types";
import { FeedCategory } from "@/lib/types";
import { badgeAccentClass, btnPrimaryClass, btnSecondaryClass, inputClass, sectionClass, selectClass, textareaClass } from "@/lib/ui";

export default function DashboardAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: FeedCategory.PublicNotices,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.announcements.getActive();
      setAnnouncements(data);
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.announcements.create({
        ...form,
        isActive: true,
        effectiveFrom: new Date().toISOString(),
      });
      setForm({ title: "", content: "", category: FeedCategory.PublicNotices });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create announcement");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(id: string) {
    try {
      await api.announcements.deactivate(id);
      await load();
    } catch {
      /* ignore */
    }
  }

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className={sectionClass + " space-y-4"}>
        <h2 className="font-semibold text-charcoal">New Announcement</h2>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: Number(e.target.value) as FeedCategory })} className={selectClass}>
          {Object.entries(FEED_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <textarea required rows={4} placeholder="Announcement content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className={textareaClass} />
        <button type="submit" disabled={submitting} className={`${btnPrimaryClass} w-auto px-6`}>
          {submitting ? "Publishing…" : "Publish Announcement"}
        </button>
      </form>

      <div className="space-y-3">
        {announcements.map((item) => (
          <article key={item.id} className={sectionClass + " flex flex-wrap items-start justify-between gap-3"}>
            <div>
              <span className={badgeAccentClass}>{FEED_CATEGORY_LABELS[item.category]}</span>
              <h3 className="mt-2 font-semibold text-charcoal">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-fg">{item.content}</p>
              <p className="mt-2 text-xs text-muted-fg">{format(new Date(item.createdAt), "PPP")}</p>
            </div>
            {item.isActive && (
              <button
                type="button"
                onClick={() => handleDeactivate(item.id)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300"
              >
                Deactivate
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
