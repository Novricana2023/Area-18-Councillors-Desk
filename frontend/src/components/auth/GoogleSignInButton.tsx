"use client";

import { GoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { isGoogleAuthEnabled, type GooglePortal } from "@/lib/google";

interface GoogleSignInButtonProps {
  portal: GooglePortal;
  onError?: (message: string) => void;
}

export function GoogleSignInButton({ portal, onError }: GoogleSignInButtonProps) {
  const { googleLogin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!isGoogleAuthEnabled) {
    return null;
  }

  const redirectPath = portal === "councillor" ? "/dashboard" : "/";

  return (
    <div className="relative flex flex-col items-center gap-3">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80">
          <Loader2 className="h-6 w-6 animate-spin text-navy" aria-hidden />
          <span className="sr-only">Signing in with Google…</span>
        </div>
      )}
      <div className="w-full [&>div]:!w-full">
        <GoogleLogin
          onSuccess={async (response) => {
            if (!response.credential) return;
            setLoading(true);
            try {
              await googleLogin(response.credential, portal);
              router.push(redirectPath);
            } catch (err) {
              onError?.(err instanceof ApiError ? err.message : "Google sign-in failed");
            } finally {
              setLoading(false);
            }
          }}
          onError={() => onError?.("Google sign-in was cancelled or failed")}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          width="320"
        />
      </div>
    </div>
  );
}

export function GoogleSignInDivider() {
  if (!isGoogleAuthEnabled) return null;
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-200" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-white px-3 font-medium text-slate-500">or continue with Google</span>
      </div>
    </div>
  );
}
