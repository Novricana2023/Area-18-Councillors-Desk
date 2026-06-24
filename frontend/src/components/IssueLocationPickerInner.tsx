"use client";

import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { btnSecondaryClass } from "@/lib/ui";
import { MapPin, Navigation } from "lucide-react";

const pinIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapClickHandler({
  onPick,
}: {
  onPick: (coords: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(event) {
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

interface IssueLocationPickerInnerProps {
  center: { lat: number; lng: number };
  position: { lat: number; lng: number };
  onChange: (coords: { lat: number; lng: number }) => void;
}

export default function IssueLocationPickerInner({
  center,
  position,
  onChange,
}: IssueLocationPickerInnerProps) {
  const [marker, setMarker] = useState(position);

  useEffect(() => {
    setMarker(position);
  }, [position.lat, position.lng]);

  function pick(coords: { lat: number; lng: number }) {
    setMarker(coords);
    onChange(coords);
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => pick({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => undefined,
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm text-muted-fg">
          <MapPin className="h-4 w-4 text-navy" />
          Click the map to pin the exact location of the issue
        </p>
        <button type="button" onClick={useMyLocation} className={btnSecondaryClass + " gap-2 py-2 text-xs"}>
          <Navigation className="h-3.5 w-3.5" />
          Use my location
        </button>
      </div>
      <div className="h-64 overflow-hidden rounded-lg border border-border">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={15}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onPick={pick} />
          <Marker position={[marker.lat, marker.lng]} icon={pinIcon} />
        </MapContainer>
      </div>
      <p className="font-mono text-xs text-muted-fg">
        {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
      </p>
    </div>
  );
}
