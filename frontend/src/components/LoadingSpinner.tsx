import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ className, label = "Loading…" }: { className?: string; label?: string }) {
  return (
    <div role="status" aria-label={label} className={cn("flex items-center justify-center gap-2 text-navy", className)}>
      <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  );
}
