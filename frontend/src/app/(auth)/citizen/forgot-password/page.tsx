"use client";



import Link from "next/link";

import { useState } from "react";

import { AuthLayout } from "@/components/AuthLayout";

import { LoadingSpinner } from "@/components/LoadingSpinner";

import { api, ApiError } from "@/lib/api";

import { btnPrimaryClass, errorBoxClass, inputClass, labelClass } from "@/lib/ui";



export default function ForgotPasswordPage() {

  const [email, setEmail] = useState("");

  const [sent, setSent] = useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);



  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    setError("");

    setLoading(true);

    try {

      await api.auth.forgotPassword({ email });

      setSent(true);

    } catch (err) {

      setError(err instanceof ApiError ? err.message : "Request failed");

    } finally {

      setLoading(false);

    }

  }



  return (

    <AuthLayout

      portal="citizen"

      title="Forgot Password"

      subtitle="We'll send reset instructions to your email"

    >

      {sent ? (

        <div className="text-center">

          <p className="text-sm text-slate-700 dark:text-slate-300">

            If an account exists for <strong className="text-slate-900 dark:text-white">{email}</strong>, you will receive

            reset instructions shortly.

          </p>

          <Link href="/citizen/login" className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:underline dark:text-blue-400">

            Back to sign in

          </Link>

        </div>

      ) : (

        <form onSubmit={handleSubmit} className="space-y-5">

          {error && <p className={errorBoxClass}>{error}</p>}

          <div>

            <label htmlFor="email" className={labelClass}>Email</label>

            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="you@example.com" />

          </div>

          <button type="submit" disabled={loading} className={btnPrimaryClass}>

            {loading ? <LoadingSpinner className="text-white" /> : "Send Reset Link"}

          </button>

        </form>

      )}

    </AuthLayout>

  );

}

