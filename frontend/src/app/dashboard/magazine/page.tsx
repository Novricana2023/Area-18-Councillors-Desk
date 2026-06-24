"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { api, ApiError } from "@/lib/api";
import type { ArticleDto } from "@/lib/types";
import { btnPrimaryClass, btnSecondaryClass, inputClass, sectionClass, textareaClass } from "@/lib/ui";

export default function DashboardMagazinePage() {
  const [articles, setArticles] = useState<ArticleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    coverImageUrl: "",
    isPublished: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.magazine.getPublished(1, 100);
      setArticles(data);
    } catch {
      setArticles([]);
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
      await api.magazine.create({
        ...form,
        coverImageUrl: form.coverImageUrl || null,
      });
      setForm({
        title: "",
        summary: "",
        content: "",
        coverImageUrl: "",
        isPublished: false,
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save article");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTogglePublish(article: ArticleDto) {
    try {
      await api.magazine.update(article.id, {
        title: article.title,
        summary: article.summary,
        content: article.content,
        coverImageUrl: article.coverImageUrl,
        isPublished: !article.isPublished,
      });
      await load();
    } catch {
      /* ignore */
    }
  }

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className={sectionClass + " space-y-4"}>
        <h2 className="font-semibold text-charcoal">Magazine Editor</h2>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <input required placeholder="Article title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
        <input required placeholder="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className={inputClass} />
        <input placeholder="Cover image URL (optional)" value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} className={inputClass} />
        <textarea required rows={8} placeholder="Article content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className={textareaClass} />
        <label className="flex items-center gap-2 text-sm text-charcoal">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="h-4 w-4 rounded border-border text-navy focus:ring-navy/30" />
          Publish immediately
        </label>
        <button type="submit" disabled={submitting} className={`${btnPrimaryClass} w-auto px-6`}>
          {submitting ? "Saving…" : "Save Article"}
        </button>
      </form>

      <div className="space-y-3">
        {articles.map((article) => (
          <article key={article.id} className={sectionClass + " flex flex-wrap items-center justify-between gap-3"}>
            <div>
              <h3 className="font-semibold text-charcoal">{article.title}</h3>
              <p className="text-sm text-muted-fg">{article.summary}</p>
              <p className="mt-1 text-xs text-muted-fg">
                {format(new Date(article.createdAt), "PPP")} · {article.isPublished ? "Published" : "Draft"}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/magazine/${article.id}`} className={btnSecondaryClass + " py-1.5 text-xs"}>Preview</Link>
              <button type="button" onClick={() => handleTogglePublish(article)} className={btnPrimaryClass + " py-1.5 text-xs"}>
                {article.isPublished ? "Unpublish" : "Publish"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
