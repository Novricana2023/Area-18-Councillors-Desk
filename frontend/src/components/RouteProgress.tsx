"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const timer = setTimeout(() => setActive(false), 600);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!active) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-[100] h-1 overflow-hidden bg-navy/10">
      <div className="h-full w-1/3 animate-[route-progress_0.8s_ease-in-out_infinite] bg-[#e07a2f]" />
    </div>
  );
}
