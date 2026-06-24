"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { MalawiFlag } from "@/components/MalawiFlag";
import { SITE_BRAND } from "@/lib/constants";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  portal?: "citizen" | "councillor";
}

export function AuthLayout({ children, title, subtitle, portal }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4 sm:max-w-xl sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <MalawiFlag className="h-8 w-12 rounded-sm ring-1 ring-slate-200" />
            <div>
              <p className="text-sm font-semibold text-slate-900">{SITE_BRAND}</p>
              <p className="text-xs text-slate-600">Area 18 · Lilongwe</p>
            </div>
          </Link>
          <Link href="/login" className="text-xs font-medium text-[#0f2d52] hover:underline">
            Portals
          </Link>
        </div>
      </header>

      {/* Form card */}
      <main className="mx-auto max-w-lg px-4 py-8 sm:max-w-xl sm:px-6 sm:py-10">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md sm:p-8">
          {portal && (
            <span
              className={`mb-4 inline-flex rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                portal === "councillor"
                  ? "bg-[#0f2d52] text-white"
                  : "bg-orange-100 text-orange-900"
              }`}
            >
              {portal === "councillor" ? "Councillor Portal" : "Citizen Portal"}
            </span>
          )}
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-6 text-center text-sm text-slate-600">
          <Link href="/" className="font-medium text-[#0f2d52] hover:underline">
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
