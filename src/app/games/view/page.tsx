"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameView } from "@/components/game-view";
import { Button } from "@/components/ui/button";
import { deleteLocalGame, findLocalGame } from "@/lib/browser-data";
import { useQueryParam } from "@/lib/query";
import type { GameRecord } from "@/lib/types";

export default function GameViewPage() {
  const id = useQueryParam("id");
  const router = useRouter();
  const [game, setGame] = useState<GameRecord | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("경기 주소가 올바르지 않습니다.");
      setGame(null);
      return;
    }
    let cancelled = false;
    setError("");
    findLocalGame(id)
      .then((found) => {
        if (cancelled) return;
        if (!found) setError("이 브라우저에 해당 경기가 없습니다.");
        else setGame(found);
      })
      .catch((caught: Error) => {
        if (!cancelled) setError(caught.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function remove() {
    if (!game) return;
    const label = `${game.away.shortName} ${game.linescore.awayR} : ${game.home.shortName} ${game.linescore.homeR}`;
    if (!window.confirm(`이 경기 기록을 지울까요?\n${label}`)) return;
    setBusy(true);
    try {
      await deleteLocalGame(game.id);
      router.push("/games");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "지우지 못했습니다.");
      setBusy(false);
    }
  }

  if (error && !game) return <main className="px-3 py-8 text-sm sm:px-4">{error}</main>;
  if (!game) return <main className="px-3 py-8 text-sm text-muted-foreground sm:px-4">경기 기록을 불러오는 중입니다.</main>;
  return (
    <main className="mx-auto grid w-full min-w-0 max-w-6xl gap-4 px-3 py-5 sm:px-4 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs tracking-[0.18em] text-primary">경기 상세</p>
        <Button type="button" variant="destructive" className="h-9" disabled={busy} onClick={() => void remove()}>
          {busy ? "지우는 중" : "이 기록 삭제"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <GameView game={game} />
    </main>
  );
}
