"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireCouncillor?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireCouncillor = false,
  redirectTo = "/citizen/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, isCouncillor, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }
    if (requireCouncillor && !isCouncillor) {
      router.replace("/");
    }
  }, [loading, isAuthenticated, isCouncillor, requireCouncillor, redirectTo, router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated || (requireCouncillor && !isCouncillor)) {
    return null;
  }

  return <>{children}</>;
}
