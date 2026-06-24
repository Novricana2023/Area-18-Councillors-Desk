"use client";

import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

interface PhotoGalleryProps {
  urls: string[];
  title?: string;
  className?: string;
}

export function PhotoGallery({ urls, title = "Issue photo", className }: PhotoGalleryProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const resolved = urls.map(resolveMediaUrl).filter(Boolean);

  if (resolved.length === 0) return null;

  return (
    <>
      <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
        {resolved.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setLightbox(src)}
            className="group relative overflow-hidden rounded-lg border border-border bg-muted text-left"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${title} ${index + 1}`}
              className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]"
              loading="lazy"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
              <ZoomIn className="h-8 w-8 text-white opacity-0 drop-shadow transition group-hover:opacity-100" />
            </span>
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close photo"
          >
            <X className="h-6 w-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt={title}
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
