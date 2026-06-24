"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ISSUE_CATEGORY_LABELS, ISSUE_STATUS_LABELS } from "@/lib/constants";
import type { IssueDto } from "@/lib/types";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface AreaMapInnerProps {
  center: { lat: number; lng: number };
  issues: IssueDto[];
  height: string;
}

export default function AreaMapInner({ center, issues, height }: AreaMapInnerProps) {
  const markers = issues.filter(
    (issue) => issue.latitude != null && issue.longitude != null,
  );

  return (
    <div className={`${height} overflow-hidden rounded-lg border border-slate-200`}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[center.lat, center.lng]} icon={defaultIcon}>
          <Popup>
            <strong>Area 18, Lilongwe</strong>
            <br />
            Ward centre
          </Popup>
        </Marker>
        {markers.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.latitude!, issue.longitude!]}
            icon={defaultIcon}
          >
            <Popup>
              <strong>{issue.title}</strong>
              <br />
              {ISSUE_CATEGORY_LABELS[issue.category]} · {ISSUE_STATUS_LABELS[issue.status]}
              <br />
              <a href={`/issues/${issue.id}`} className="text-blue-700 underline">
                View issue
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
