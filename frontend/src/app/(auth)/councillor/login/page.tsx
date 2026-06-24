"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleSignInButton, GoogleSignInDivider } from "@/components/auth/GoogleSignInButton";
import { AuthLayout } from "@/components/AuthLayout";
import { SubmitButton } from "@/components/SubmitButton";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { btnPrimaryClass, errorBoxClass, formFieldClass, inputClass, labelClass } from "@/lib/ui";

export default function CouncillorLoginPage() {
  const { councillorLogin } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await councillorLogin({ email, password });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout portal="councillor" title="Councillor & Staff Sign In" subtitle="Secure access for Area 18 ward management">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className={errorBoxClass}>{error}</p>}
        <div className={formFieldClass}>
          <label htmlFor="email" className={labelClass}>Official email</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="admin@area18.mw" />
        </div>
        <div className={formFieldClass}>
          <label htmlFor="password" className={labelClass}>Password</label>
          <input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="Enter your password" />
        </div>
        <SubmitButton loading={loading} loadingText="Signing in…" className={btnPrimaryClass}>
          Sign In with Email
        </SubmitButton>
      </form>

      <GoogleSignInDivider />
      <GoogleSignInButton portal="councillor" onError={setError} />

      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
        <p className="font-semibold text-slate-900">Councillor portal includes:</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Manage citizen issue reports</li>
          <li>Post official announcements</li>
          <li>Publish community magazine</li>
          <li>Moderate community content</li>
        </ul>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        Resident citizen?{" "}
        <Link href="/citizen/login" className="font-semibold text-[#0f2d52] hover:underline">Use Citizen Portal</Link>
      </p>
    </AuthLayout>
  );
}
