"use client";



import Link from "next/link";

import { useRouter, useSearchParams } from "next/navigation";

import { Suspense, useState } from "react";

import { PasswordField } from "@/components/auth/PasswordField";

import { AuthLayout } from "@/components/AuthLayout";

import { LoadingSpinner } from "@/components/LoadingSpinner";

import { api, ApiError } from "@/lib/api";

import { btnPrimaryClass, errorBoxClass, inputClass, labelClass } from "@/lib/ui";



function ResetPasswordForm() {

  const searchParams = useSearchParams();

  const router = useRouter();

  const [email, setEmail] = useState(searchParams.get("email") ?? "");

  const [token, setToken] = useState(searchParams.get("token") ?? "");

  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);



  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    setError("");

    setLoading(true);

    try {

      await api.auth.resetPassword({ email, token, newPassword });

      router.push("/citizen/login");

    } catch (err) {

      setError(err instanceof ApiError ? err.message : "Reset failed");

    } finally {

      setLoading(false);

    }

  }



  return (

    <AuthLayout portal="citizen" title="Reset Password" subtitle="Enter your new password">

      <form onSubmit={handleSubmit} className="space-y-5">

        {error && <p className={errorBoxClass}>{error}</p>}

        <div>

          <label htmlFor="email" className={labelClass}>Email</label>

          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />

        </div>

        <div>

          <label htmlFor="token" className={labelClass}>Reset Token</label>

          <input id="token" type="text" required value={token} onChange={(e) => setToken(e.target.value)} className={inputClass} />

        </div>

        <PasswordField id="newPassword" value={newPassword} onChange={setNewPassword} showRules={false} />

        <button type="submit" disabled={loading} className={btnPrimaryClass}>

          {loading ? <LoadingSpinner className="text-white" /> : "Reset Password"}

        </button>

      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">

        <Link href="/citizen/login" className="font-semibold text-blue-700 hover:underline dark:text-blue-400">

          Back to sign in

        </Link>

      </p>

    </AuthLayout>

  );

}



export default function ResetPasswordPage() {

  return (

    <Suspense fallback={<LoadingSpinner className="min-h-screen" />}>

      <ResetPasswordForm />

    </Suspense>

  );

}

