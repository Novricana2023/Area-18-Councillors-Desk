"use client";

import { AppShell } from "@/components/AppShell";
import { HomeDashboard } from "@/components/HomeDashboard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PublicLanding } from "@/components/PublicLanding";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <AppShell>
      {loading ? (
        <LoadingSpinner className="min-h-[50vh]" />
      ) : isAuthenticated ? (
        <HomeDashboard />
      ) : (
        <PublicLanding />
      )}
    </AppShell>
  );
}
