"use client";

import { useEffect } from "react";
import { syncCloudQuietly } from "@/lib/cloud-sync";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // One-time: stamp arm slots onto older pitch logs so trajectories match pitcher form.
    void import("@/lib/browser-data")
      .then((mod) => mod.backfillGameArmSlots())
      .catch(() => {
        /* IndexedDB may be unavailable */
      });
    // Cursor-hosted origin only — never clears IndexedDB on failure.
    void syncCloudQuietly();
    const onFocus = () => {
      void syncCloudQuietly();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return <>{children}</>;
}
