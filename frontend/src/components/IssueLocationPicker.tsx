"use client";

import dynamic from "next/dynamic";
import { AREA_18_CENTER } from "@/lib/constants";

const IssueLocationPickerInner = dynamic(
  () => import("@/components/IssueLocationPickerInner"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-muted text-sm text-muted-fg">
        Loading map…
      </div>
    ),
  },
);

interface IssueLocationPickerProps {
  latitude: number;
  longitude: number;
  onChange: (coords: { lat: number; lng: number }) => void;
}

export function IssueLocationPicker({ latitude, longitude, onChange }: IssueLocationPickerProps) {
  return (
    <IssueLocationPickerInner
      center={AREA_18_CENTER}
      position={{ lat: latitude, lng: longitude }}
      onChange={onChange}
    />
  );
}
