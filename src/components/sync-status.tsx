"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { buildLocalVault, syncCloudVault } from "@/lib/cloud-sync";

const APP_URL = (process.env.NEXT_PUBLIC_DIARI_APP_URL ?? "").replace(/\/$/, "");

export function SyncStatus() {
  const [message, setMessage] = useState("기록을 이 브라우저에 보관합니다.");
  const [busy, setBusy] = useState(false);
  const [onPages, setOnPages] = useState(false);

  useEffect(() => {
    const pages = window.location.hostname.endsWith("github.io");
    setOnPages(pages);
    if (pages) {
      setMessage(
        APP_URL
          ? "이 브라우저 기록은 그대로 둡니다. 아래 버튼으로 Cursor 로그인 앱에 한 번 넘기면, 이후 폰·PC가 자동으로 맞춰집니다."
          : "이 주소의 기록은 이 브라우저에 남습니다. 폰·PC 자동 연결은 Cursor에 로그인한 동기화 앱에서 이뤄집니다.",
      );
      return;
    }
    void syncCloudVault().then((result) => setMessage(result.message));
  }, []);

  async function refresh() {
    setBusy(true);
    const result = await syncCloudVault();
    setMessage(result.message);
    setBusy(false);
  }

  async function handoffToCloudApp() {
    if (!APP_URL) {
      setMessage("동기화 앱 주소가 아직 연결되지 않았습니다. Cursor에 올린 private 앱을 연 뒤 쓰세요.");
      return;
    }
    setBusy(true);
    try {
      const vault = await buildLocalVault();
      if (vault.games.length === 0 && vault.teams.length === 0) {
        setMessage("옮길 경기·팀이 없습니다. 이 브라우저 기록은 그대로입니다.");
        return;
      }
      const recv = window.open(`${APP_URL}/recv`, "diari-recv");
      if (!recv) {
        setMessage("팝업이 막혔습니다. 팝업을 허용하거나, 동기화 앱을 직접 연 뒤 다시 눌러 주세요.");
        return;
      }
      const onReady = (event: MessageEvent) => {
        if (event.origin !== new URL(APP_URL).origin) return;
        if (event.data?.type !== "diari-recv-ready") return;
        recv.postMessage({ type: "diari-vault", payload: vault }, event.origin);
        window.localStorage.setItem("diari-handoff-done", "1");
        window.removeEventListener("message", onReady);
        setMessage("기록을 동기화 앱으로 넘겼습니다. 이 브라우저 IndexedDB 원본은 지우지 않았습니다.");
      };
      window.addEventListener("message", onReady);
      window.setTimeout(() => window.removeEventListener("message", onReady), 60_000);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="grid gap-2 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium">기록 동기화</h2>
        {onPages ? (
          APP_URL ? (
            <Button type="button" variant="outline" className="h-9" disabled={busy} onClick={handoffToCloudApp}>
              {busy ? "넘기는 중" : "클라우드로 이어받기"}
            </Button>
          ) : null
        ) : (
          <Button type="button" variant="outline" className="h-9" disabled={busy} onClick={refresh}>
            {busy ? "맞추는 중" : "지금 맞추기"}
          </Button>
        )}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{message}</p>
    </section>
  );
}
