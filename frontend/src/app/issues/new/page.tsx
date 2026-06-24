"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { IssueSubmittedSuccess } from "@/components/IssueSubmittedSuccess";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SubmitButton } from "@/components/SubmitButton";
import { api, ApiError } from "@/lib/api";
import { ISSUE_CATEGORY_LABELS, AREA_18_CENTER } from "@/lib/constants";
import { IssueCategory } from "@/lib/types";
import { IssueLocationPicker } from "@/components/IssueLocationPicker";
import { PageHeader } from "@/components/PageHeader";
import { btnPrimaryClass, cardClass, errorBoxClass, inputClass, labelClass, selectClass, textareaClass } from "@/lib/ui";

export default function NewIssuePage() {
  return (
    <AppShell>
      <ProtectedRoute>
        <NewIssueForm />
      </ProtectedRoute>
    </AppShell>
  );
}

function NewIssueForm() {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Submitting…");
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState<{ referenceNumber: string; issueId: string; title: string } | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: IssueCategory.Other,
    location: "Area 18, Lilongwe",
    latitude: AREA_18_CENTER.lat,
    longitude: AREA_18_CENTER.lng,
    isPrivate: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const photoUrls: string[] = [];
      if (photos.length > 0) {
        setLoadingMessage(`Uploading ${photos.length} photo${photos.length === 1 ? "" : "s"}…`);
        photoUrls.push(...await Promise.all(photos.map((file) => api.upload.image(file, "issues"))));
      }

      setLoadingMessage("Saving your report…");
      const issue = await api.issues.create({ ...form, photoUrls });
      setSubmitted({
        referenceNumber: issue.referenceNumber ?? issue.id,
        issueId: issue.id,
        title: issue.title,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit issue");
    } finally {
      setLoading(false);
      setLoadingMessage("Submitting…");
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-8">
        <IssueSubmittedSuccess
          referenceNumber={submitted.referenceNumber}
          issueId={submitted.issueId}
          title={submitted.title}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <PageHeader title="Report an Issue" subtitle="Help improve Area 18 by reporting problems in your neighbourhood." />

      <form onSubmit={handleSubmit} className={cardClass + " space-y-5"}>
        {error && <p className={errorBoxClass}>{error}</p>}
        <div>
          <label htmlFor="title" className={labelClass}>Title</label>
          <input id="title" required maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label htmlFor="category" className={labelClass}>Category</label>
          <select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: Number(e.target.value) as IssueCategory })} className={selectClass}>
            {Object.entries(ISSUE_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="description" className={labelClass}>Description</label>
          <textarea id="description" required rows={5} maxLength={4000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={textareaClass} />
        </div>
        <div>
          <label htmlFor="location" className={labelClass}>Location description</label>
          <input id="location" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} placeholder="e.g. Near Area 18 Market, Main Road" />
        </div>
        <div>
          <label className={labelClass}>Pin on map</label>
          <IssueLocationPicker
            latitude={form.latitude}
            longitude={form.longitude}
            onChange={({ lat, lng }) => setForm({ ...form, latitude: lat, longitude: lng })}
          />
        </div>
        <div>
          <label htmlFor="photos" className={labelClass}>Photos (optional)</label>
          <input id="photos" type="file" accept="image/*" multiple onChange={(e) => setPhotos(Array.from(e.target.files ?? []))} className="w-full text-sm text-muted-fg file:mr-4 file:rounded-md file:border-0 file:bg-navy/5 file:px-4 file:py-2 file:text-sm file:font-medium file:text-navy" />
          {photos.length > 0 && (
            <p className="mt-2 text-xs text-muted-fg">{photos.length} photo{photos.length === 1 ? "" : "s"} selected — visible to everyone on the public issue page.</p>
          )}
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-4">
          <input type="checkbox" checked={form.isPrivate} onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })} className="mt-1 h-4 w-4 rounded border-border text-navy focus:ring-navy/30" />
          <span>
            <span className="block text-sm font-medium text-charcoal">Submit as private report</span>
            <span className="mt-1 block text-xs text-muted-fg">Private reports are only visible to councillors and administrators.</span>
          </span>
        </label>
        <SubmitButton loading={loading} loadingText={loadingMessage} className={btnPrimaryClass}>
          Submit Issue
        </SubmitButton>
      </form>
    </div>
  );
}
