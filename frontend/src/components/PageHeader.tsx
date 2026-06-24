import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { pageSubtitleClass, pageTitleClass } from "@/lib/ui";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        <h1 className={pageTitleClass}>{title}</h1>
        {subtitle && <p className={pageSubtitleClass}>{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
