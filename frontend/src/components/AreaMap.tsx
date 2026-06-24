"use client";

import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AREA_18_CENTER } from "@/lib/constants";
import type { IssueDto } from "@/lib/types";

const MapInner = dynamic(() => import("./AreaMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
      <LoadingSpinner />
    </div>
  ),
});

interface AreaMapProps {
  issues?: IssueDto[];
  center?: { lat: number; lng: number };
  className?: string;
  height?: string;
}

export function AreaMap({ issues = [], center = AREA_18_CENTER, className, height = "h-80" }: AreaMapProps) {
  return (
    <div className={className}>
      <MapInner center={center} issues={issues} height={height} />
    </div>
  );
}
