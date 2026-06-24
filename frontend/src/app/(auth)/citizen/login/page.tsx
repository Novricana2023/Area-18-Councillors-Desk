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

export default function CitizenLoginPage() {
  const { login } = useAuth();
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
      await login({ email, password });
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout portal="citizen" title="Citizen Sign In" subtitle="Report issues and stay connected with Area 18">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className={errorBoxClass}>{error}</p>}
        <div className={formFieldClass}>
          <label htmlFor="email" className={labelClass}>Email address</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="you@example.com" />
        </div>
        <div className={formFieldClass}>
          <label htmlFor="password" className={labelClass}>Password</label>
          <input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="Enter your password" />
        </div>
        <div className="text-right">
          <Link href="/citizen/forgot-password" className="text-xs font-semibold text-[#0f2d52] hover:underline">Forgot password?</Link>
        </div>
        <SubmitButton loading={loading} loadingText="Signing in…" className={btnPrimaryClass}>
          Sign In with Email
        </SubmitButton>
      </form>

      <GoogleSignInDivider />
      <GoogleSignInButton portal="citizen" onError={setError} />

      <p className="mt-6 text-center text-sm text-slate-600">
        New to Area 18?{" "}
        <Link href="/citizen/register" className="font-semibold text-[#0f2d52] hover:underline">Create citizen account</Link>
      </p>
      <p className="mt-2 text-center text-xs text-slate-500">
        Councillor or staff?{" "}
        <Link href="/councillor/login" className="font-medium text-slate-700 hover:underline">Councillor Portal</Link>
      </p>
    </AuthLayout>
  );
}
