"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleSignInButton, GoogleSignInDivider } from "@/components/auth/GoogleSignInButton";
import { PasswordField } from "@/components/auth/PasswordField";
import { AuthLayout } from "@/components/AuthLayout";
import { SubmitButton } from "@/components/SubmitButton";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { isPasswordValid } from "@/lib/validation";
import { btnPrimaryClass, errorBoxClass, formFieldClass, hintClass, inputClass, labelClass } from "@/lib/ui";

export default function CitizenRegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    displayName: "",
    commentNote: "",
    nationalId: "",
    phoneNumber: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isPasswordValid(form.password)) {
      setError("Please meet all password requirements.");
      return;
    }
    if (!agreedToTerms) {
      setError("You must agree to the Terms and Conditions.");
      return;
    }
    setLoading(true);
    try {
      await register({
        ...form,
        commentNote: form.commentNote || null,
        phoneNumber: form.phoneNumber || null,
        agreedToTerms: true,
      });
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout portal="citizen" title="Create Citizen Account" subtitle="Join Councillors Desk for Area 18">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className={errorBoxClass}>{error}</p>}
        <div className={formFieldClass}>
          <label htmlFor="fullName" className={labelClass}>Legal full name</label>
          <input id="fullName" required maxLength={100} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputClass} placeholder="Your full legal name" />
        </div>
        <div className={formFieldClass}>
          <label htmlFor="displayName" className={labelClass}>
            Profile name <span className={hintClass}>(shown on comments)</span>
          </label>
          <input id="displayName" required maxLength={50} placeholder="e.g. Grace from Block 4" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className={inputClass} />
        </div>
        <div className={formFieldClass}>
          <label htmlFor="commentNote" className={labelClass}>
            Commenting note <span className={hintClass}>(optional)</span>
          </label>
          <input id="commentNote" maxLength={200} placeholder="e.g. Resident of Zone B" value={form.commentNote} onChange={(e) => setForm({ ...form, commentNote: e.target.value })} className={inputClass} />
        </div>
        <div className={formFieldClass}>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input id="email" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="you@example.com" />
        </div>
        <div className={formFieldClass}>
          <label htmlFor="nationalId" className={labelClass}>National ID</label>
          <input id="nationalId" required maxLength={20} value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} className={inputClass} placeholder="Your national ID number" />
        </div>
        <div className={formFieldClass}>
          <label htmlFor="phoneNumber" className={labelClass}>
            Phone <span className={hintClass}>(optional)</span>
          </label>
          <input id="phoneNumber" type="tel" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} className={inputClass} placeholder="+265..." />
        </div>
        <PasswordField value={form.password} onChange={(password) => setForm({ ...form, password })} />
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-slate-200 bg-slate-50 p-3">
          <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-400 text-[#0f2d52] focus:ring-[#0f2d52]" />
          <span className="text-sm text-slate-800">
            I agree to the{" "}
            <Link href="/terms" target="_blank" className="font-semibold text-[#0f2d52] hover:underline">Terms and Conditions</Link>
          </span>
        </label>
        <SubmitButton loading={loading} loadingText="Creating account…" disabled={!agreedToTerms} className={btnPrimaryClass}>
          Create Account
        </SubmitButton>
      </form>

      <GoogleSignInDivider />
      <GoogleSignInButton portal="citizen" onError={setError} />

      <p className="mt-6 text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link href="/citizen/login" className="font-semibold text-[#0f2d52] hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
