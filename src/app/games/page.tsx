"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { whenLabel } from "@/components/game-view";
import { SyncStatus } from "@/components/sync-status";
import { Button } from "@/components/ui/button";
import { deleteLocalGame, listLocalGames } from "@/lib/browser-data";
import { gamePath } from "@/lib/paths";
import type { GameRecord } from "@/lib/types";

export default function GamesPage() {
  const [games, setGames] = useState<GameRecord[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    listLocalGames()
      .then(setGames)
      .catch((caught: Error) => setError(caught.message));
  }, []);

  async function remove(game: GameRecord) {
    const label = `${game.away.shortName} ${game.linescore.awayR} : ${game.home.shortName} ${game.linescore.homeR}`;
    if (!window.confirm(`이 경기 기록을 지울까요?\n${label}`)) return;
    setBusyId(game.id);
    setError("");
    try {
      await deleteLocalGame(game.id);
      setGames((prev) => (prev ? prev.filter((row) => row.id !== game.id) : prev));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "지우지 못했습니다.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className="mx-auto grid w-full min-w-0 max-w-3xl gap-4 px-3 py-5 sm:px-4 sm:py-6">
      <div>
        <p className="text-xs tracking-[0.18em] text-primary">기록</p>
        <h1 className="font-heading text-3xl sm:text-4xl">지난 경기</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          원하지 않는 경기는 삭제할 수 있습니다. 삭제한 기록은 이 브라우저에서 바로 사라집니다.
        </p>
      </div>
      <SyncStatus />
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!games && !error && <p className="text-sm text-muted-foreground">불러오는 중입니다.</p>}
      {games && games.length === 0 && (
        <p className="text-sm text-muted-foreground">
          아직 치른 경기가 없습니다. <Link href="/play" className="text-primary underline">경기 화면</Link>에서 시작할 수 있습니다.
        </p>
      )}
      <ul className="grid gap-2">
        {games?.map((game) => (
          <li key={game.id} className="flex items-stretch gap-2 rounded-2xl border border-border bg-card p-2 sm:p-3">
            <Link href={gamePath(game.id)} className="min-w-0 flex-1 rounded-xl px-2 py-1 hover:bg-muted/40 sm:px-3 sm:py-2">
              <p className="font-medium">
                {game.away.shortName} {game.linescore.awayR} : {game.home.shortName} {game.linescore.homeR}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{game.summary}</p>
              <p className="mt-1 text-xs text-muted-foreground">{whenLabel(game.createdAt)}</p>
            </Link>
            <Button
              type="button"
              variant="destructive"
              className="h-9 shrink-0 self-center"
              disabled={busyId === game.id}
              onClick={() => void remove(game)}
            >
              {busyId === game.id ? "지우는 중" : "삭제"}
            </Button>
          </li>
        ))}
      </ul>
    </main>
  );
}
