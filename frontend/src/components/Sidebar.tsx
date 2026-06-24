"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Home,
  LayoutDashboard,
  LocateFixed,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { MalawiFlag } from "@/components/MalawiFlag";
import { useAuth } from "@/context/AuthContext";
import { SITE_BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

const publicLinks = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/issues", label: "Community", icon: FileText },
  { href: "/announcements", label: "Announcements", icon: MessageSquare },
  { href: "/issues/track", label: "Track Issue", icon: LocateFixed },
];

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
        active
          ? "border-l-2 border-[#e07a2f] bg-white/10 pl-[10px] text-white"
          : "text-white/80 hover:bg-white/5 hover:text-white",
      )}
    >
      <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-[#e07a2f]")} />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const { isAuthenticated, isCouncillor, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    ...publicLinks,
    ...(isCouncillor
      ? [{ href: "/dashboard", label: "Councillor Dashboard", icon: LayoutDashboard, exact: false }]
      : []),
  ];

  const displayLabel = user?.displayName ?? user?.fullName?.split(" ")[0];

  const sidebarContent = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-5">
        <Link href="/" className="flex items-center gap-3" onClick={onNavigate}>
          <MalawiFlag className="h-8 w-12 shrink-0 rounded-sm ring-1 ring-white/20" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-white">{SITE_BRAND}</p>
            <p className="truncate text-xs text-white/70">Area 18 · Lilongwe</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {links.map((link) => (
          <NavLink key={link.href} {...link} onClick={onNavigate} />
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        {isAuthenticated ? (
          <div className="space-y-1">
            <div className="mb-2 px-3 py-2">
              <p className="truncate text-sm font-medium text-white">{displayLabel}</p>
              <p className="truncate text-xs text-white/60">{user?.email}</p>
            </div>
            <NavLink href="/profile" label="Profile" icon={User} onClick={onNavigate} />
            <button
              type="button"
              onClick={() => { logout(); onNavigate?.(); }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              Sign out
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-lg bg-[#e07a2f] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c96824]"
          >
            <LogIn className="h-[18px] w-[18px] shrink-0" />
            Sign in
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <button type="button" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-900 hover:bg-slate-100" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <MalawiFlag className="h-6 w-9 rounded-sm" />
          <span className="text-sm font-semibold text-slate-900">{SITE_BRAND}</span>
        </Link>
        <div className="w-9" />
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-[#0f2d52] shadow-xl">
            <button type="button" onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 rounded-lg p-1.5 text-white/80 hover:bg-white/10" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            {sidebarContent(() => setMobileOpen(false))}
          </aside>
        </div>
      )}

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#0f2d52] lg:flex">
        {sidebarContent()}
      </aside>
    </>
  );
}
