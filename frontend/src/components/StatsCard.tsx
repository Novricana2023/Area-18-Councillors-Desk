import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  className?: string;
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-5", className)}>
      <div className="mb-4 flex items-start justify-between">
        <div className="rounded-md bg-navy/5 p-2.5 text-navy">
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="rounded-md bg-accent-light px-2 py-0.5 text-xs font-medium text-[#b45309]">
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-muted-fg">{title}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-charcoal">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-muted-fg">{subtitle}</p>}
    </div>
  );
}
