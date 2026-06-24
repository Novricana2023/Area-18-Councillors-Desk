"use client";

import Link from "next/link";
import { Shield, Users } from "lucide-react";
import { MalawiFlag } from "@/components/MalawiFlag";
import { SITE_BRAND } from "@/lib/constants";

export default function LoginHubPage() {
  return (
    <div className="min-h-screen bg-muted">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-12">
        <div className="mb-10 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <MalawiFlag className="h-10 w-16 rounded-sm ring-1 ring-border" />
            <span className="text-sm font-medium text-muted-fg">Republic of Malawi</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">{SITE_BRAND}</h1>
          <p className="mt-2 text-sm text-muted-fg">Area 18 · Lilongwe · Malawi</p>
          <p className="mt-4 text-sm text-muted-fg">Select your portal to continue</p>
        </div>

        <div className="grid w-full gap-4 sm:grid-cols-2">
          <Link
            href="/citizen/login"
            className="group rounded-lg border border-border bg-white p-8 transition hover:border-navy/30 hover:shadow-sm"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-navy/5 text-navy transition group-hover:bg-navy group-hover:text-white">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-charcoal">Citizen Portal</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-fg">
              Report issues, follow progress, join the community feed, and receive ward updates.
            </p>
            <p className="mt-4 text-sm font-medium text-navy group-hover:underline">Sign in or register →</p>
          </Link>

          <Link
            href="/councillor/login"
            className="group rounded-lg border border-border bg-white p-8 transition hover:border-navy/30 hover:shadow-sm"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-navy/5 text-navy transition group-hover:bg-navy group-hover:text-white">
              <Shield className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-charcoal">Councillor Portal</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-fg">
              Manage issues, post announcements, moderate content, and serve Area 18 residents.
            </p>
            <p className="mt-4 text-sm font-medium text-navy group-hover:underline">Staff sign in →</p>
          </Link>
        </div>

        <Link href="/" className="mt-10 text-sm font-medium text-navy hover:underline">← Back to home</Link>
      </div>
    </div>
  );
}
