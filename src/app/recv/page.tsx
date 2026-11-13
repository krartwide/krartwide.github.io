"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { applyVault, syncCloudQuietly } from "@/lib/cloud-sync";
import type { VaultPayload } from "@/lib/vault-types";

/**
 * Receives a one-time vault handoff from https://krartwide.github.io
 * so existing browser records are not lost when moving to the synced app.
 */
export default function RecvPage() {
  const [status, setStatus] = useState("다른 탭에서 기록을 기다리는 중입니다…");

  useEffect(() => {
    const allowed = new Set(["https://krartwide.github.io", "http://127.0.0.1:43123", "http://localhost:43123"]);

    function onMessage(event: MessageEvent) {
      if (!allowed.has(event.origin)) return;
      if (event.data?.type !== "diari-vault" || !event.data?.payload) return;
      const payload = event.data.payload as VaultPayload;
      void (async () => {
        setStatus("기록을 이 기기에 옮기는 중입니다…");
        await applyVault(payload);
        await syncCloudQuietly();
        setStatus(`옮겼습니다. 경기 ${payload.games?.length ?? 0}경기가 클라우드에도 맞춰집니다.`);
      })();
    }

    window.addEventListener("message", onMessage);
    // Tell the opener we are ready.
    if (window.opener) {
      try {
        window.opener.postMessage({ type: "diari-recv-ready" }, "*");
      } catch {
        // ignore
      }
    }
    // Also announce to any listener on same window flow.
    window.parent?.postMessage({ type: "diari-recv-ready" }, "*");

    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <main className="mx-auto grid max-w-lg gap-4 px-4 py-10">
      <p className="text-xs tracking-[0.18em] text-primary">SYNC</p>
      <h1 className="font-heading text-3xl">기록 이어받기</h1>
      <p className="text-sm leading-6 text-muted-foreground">{status}</p>
      <Link href="/games" className="text-sm text-primary underline">
        지난 경기로 이동
      </Link>
    </main>
  );
}
