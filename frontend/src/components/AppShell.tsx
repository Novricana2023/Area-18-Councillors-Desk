import { Footer } from "@/components/Footer";
import { NotificationBell } from "@/components/NotificationBell";
import { RouteProgress } from "@/components/RouteProgress";
import { Sidebar } from "@/components/Sidebar";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <RouteProgress />
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-20 hidden h-14 items-center justify-end gap-3 border-b border-border bg-white px-6 lg:flex">
          <NotificationBell />
        </header>
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
