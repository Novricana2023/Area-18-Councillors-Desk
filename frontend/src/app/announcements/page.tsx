"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Megaphone, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { FEED_CATEGORY_LABELS } from "@/lib/constants";
import type { AnnouncementDto } from "@/lib/types";
import { FeedCategory } from "@/lib/types";
import { btnAccentClass, btnPrimaryClass, cardClass, inputClass, selectClass, textareaClass } from "@/lib/ui";

export default function AnnouncementsPage() {
  const { isCouncillor } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: FeedCategory.PublicNotices,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAnnouncements(await api.announcements.getActive());
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
      await api.announcements.create(form);
      setForm({ title: "", content: "", category: FeedCategory.PublicNotices });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to publish announcement");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-8">
        <PageHeader
          title="Announcements"
          subtitle="Official updates from the Area 18 councillor — residents can read and discuss"
          actions={
            isCouncillor ? (
              <button type="button" onClick={() => setShowForm((v) => !v)} className={btnAccentClass + " gap-2"}>
                <Plus className="h-4 w-4" /> New Announcement
              </button>
            ) : undefined
          }
        />

        {showForm && isCouncillor && (
          <form onSubmit={handleCreate} className={cardClass + " mb-8 space-y-4"}>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <input required placeholder="Announcement title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: Number(e.target.value) as FeedCategory })} className={selectClass}>
              {Object.entries(FEED_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <textarea required rows={5} placeholder="Write the official announcement…" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className={textareaClass} />
            <button type="submit" disabled={submitting} className={btnPrimaryClass}>
              {submitting ? "Publishing…" : "Publish Announcement"}
            </button>
          </form>
        )}

        {loading ? (
          <LoadingSpinner className="py-20" />
        ) : announcements.length === 0 ? (
          <div className="py-16 text-center">
            <Megaphone className="mx-auto mb-3 h-10 w-10 text-muted-fg" />
            <p className="text-sm text-muted-fg">No announcements yet. The councillor will post official updates here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((a) => (
              <Link key={a.id} href={`/announcements/${a.id}`} className={cardClass + " block transition hover:border-navy/30"}>
                <span className="text-xs font-medium text-navy">{FEED_CATEGORY_LABELS[a.category]}</span>
                <h2 className="mt-1 text-lg font-semibold text-charcoal">{a.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted-fg">{a.content}</p>
                <p className="mt-3 text-xs text-muted-fg">
                  {a.authorName} · {format(new Date(a.createdAt), "PPP")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
