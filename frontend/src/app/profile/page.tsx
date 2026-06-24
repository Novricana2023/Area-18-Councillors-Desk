"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { btnPrimaryClass, cardClass, errorBoxClass, inputClass, labelClass, sectionClass, successBoxClass } from "@/lib/ui";

export default function ProfilePage() {
  return (
    <AppShell>
      <ProtectedRoute>
        <ProfileContent />
      </ProtectedRoute>
    </AppShell>
  );
}

function ProfileContent() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    displayName: user?.displayName ?? "",
    commentNote: user?.commentNote ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    profilePhotoUrl: user?.profilePhotoUrl ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName,
        displayName: user.displayName ?? "",
        commentNote: user.commentNote ?? "",
        phoneNumber: user.phoneNumber ?? "",
        profilePhotoUrl: user.profilePhotoUrl ?? "",
      });
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await api.auth.updateProfile({
        fullName: form.fullName,
        displayName: form.displayName,
        commentNote: form.commentNote || null,
        phoneNumber: form.phoneNumber || null,
        profilePhotoUrl: form.profilePhotoUrl || null,
      });
      await refreshUser();
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-8">
      <PageHeader title="My Profile" subtitle="Your profile name and note appear when you comment on issues." />

      <div className={sectionClass + " mb-6"}>
        <p className="text-sm text-muted-fg">Email</p>
        <p className="font-medium text-charcoal">{user?.email}</p>
        <p className="mt-3 text-sm text-muted-fg">National ID</p>
        <p className="font-medium text-charcoal">{user?.nationalId ?? "—"}</p>
        <p className="mt-3 text-sm text-muted-fg">Role</p>
        <p className="font-medium text-charcoal">{user?.role}</p>
      </div>

      <form onSubmit={handleSubmit} className={cardClass + " space-y-4"}>
        {message && <p className={successBoxClass}>{message}</p>}
        {error && <p className={errorBoxClass}>{error}</p>}
        <div>
          <label htmlFor="fullName" className={labelClass}>Legal Full Name</label>
          <input id="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label htmlFor="displayName" className={labelClass}>Profile Name (for comments)</label>
          <input id="displayName" required maxLength={50} value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label htmlFor="commentNote" className={labelClass}>Commenting Note</label>
          <input id="commentNote" maxLength={200} placeholder="e.g. Area 18 resident, Block 3" value={form.commentNote} onChange={(e) => setForm({ ...form, commentNote: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>Phone Number</label>
          <input id="phone" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label htmlFor="photo" className={labelClass}>Profile Photo URL</label>
          <input id="photo" value={form.profilePhotoUrl} onChange={(e) => setForm({ ...form, profilePhotoUrl: e.target.value })} className={inputClass} />
        </div>
        <button type="submit" disabled={loading} className={`${btnPrimaryClass} w-auto px-6`}>
          {loading ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
