"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { GOOGLE_CLIENT_ID, isGoogleAuthEnabled } from "@/lib/google";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const tree = (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );

  if (!isGoogleAuthEnabled) {
    return tree;
  }

  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{tree}</GoogleOAuthProvider>;
}
