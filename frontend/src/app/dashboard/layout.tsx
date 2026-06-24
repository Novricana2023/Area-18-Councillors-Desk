"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, BookOpen, FileText, LayoutDashboard, Megaphone } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const tabs = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/issues", label: "Issues", icon: FileText },
  { href: "/dashboard/announcements", label: "Announcements", icon: Megaphone },
  { href: "/dashboard/magazine", label: "Magazine", icon: BookOpen },
  { href: "/dashboard/moderation", label: "Moderation", icon: AlertTriangle },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AppShell>
      <ProtectedRoute requireCouncillor redirectTo="/councillor/login">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="mb-8 border-b border-border pb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Councillor Dashboard</p>
            <h1 className="mt-1 text-2xl font-semibold text-charcoal sm:text-3xl">Executive Overview</h1>
            <p className="mt-1 text-sm text-muted-fg">Manage issues, announcements, and community content for Area 18</p>
          </div>

          <nav className="mb-8 flex gap-1 overflow-x-auto border-b border-border pb-px">
            {tabs.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition",
                    active
                      ? "border-navy text-navy"
                      : "border-transparent text-muted-fg hover:border-border hover:text-charcoal",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {children}
        </div>
      </ProtectedRoute>
    </AppShell>
  );
}
