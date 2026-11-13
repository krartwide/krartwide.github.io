"use client";

import { useEffect } from "react";
import { syncCloudQuietly } from "@/lib/cloud-sync";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
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
