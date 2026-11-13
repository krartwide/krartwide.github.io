"use client";

import { idbGetAll, idbPut } from "@/lib/browser-db";
import { mergeVaults, normalizeVault } from "@/lib/vault-merge";
import type { VaultPayload } from "@/lib/vault-types";
import type { GameRecord, Team } from "@/lib/types";

type Meta = { key: string; value: string };

function canUseCloudApi() {
  if (typeof window === "undefined") return false;
  // Static GitHub Pages has no /api/vault. Cloud sync runs on the Cursor-hosted app.
  if (window.location.hostname.endsWith("github.io")) return false;
  return true;
}

export async function buildLocalVault(): Promise<VaultPayload> {
  const games = await idbGetAll<GameRecord>("games");
  const teams = await idbGetAll<Team>("teams");
  const achievements = await idbGetAll<{ key: string; earnedAt: string }>("achievements");
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    games: games.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 120),
    teams: teams.filter((team) => !team.canonical).slice(0, 80),
    achievements: achievements.slice(0, 40),
  };
}

/** Merge remotes into local storage. Never deletes local-only games. */
export async function applyVault(payload: VaultPayload) {
  const normalized = normalizeVault(payload);
  for (const game of normalized.games) {
    if (!game?.id) continue;
    const existing = await idbGetAll<GameRecord>("games").then((rows) => rows.find((row) => row.id === game.id));
    if (!existing || game.createdAt >= existing.createdAt) {
      await idbPut("games", game);
    }
  }
  for (const team of normalized.teams) {
    if (!team?.id || team.canonical) continue;
    await idbPut("teams", team);
  }
  for (const row of normalized.achievements) {
    if (!row?.key || !row.earnedAt) continue;
    await idbPut("achievements", row);
  }
}

/**
 * Pull cloud vault, merge with this browser (keeping every local game), push back.
 * No-ops on GitHub Pages (no API) or when signed-out / offline.
 */
export async function syncCloudVault(): Promise<{ ok: boolean; message: string; mergedGames: number }> {
  if (!canUseCloudApi()) {
    return { ok: false, message: "이 주소에서는 클라우드 동기화가 없습니다.", mergedGames: 0 };
  }

  const local = await buildLocalVault();
  let remote: VaultPayload | null = null;

  try {
    const res = await fetch("/api/vault", { credentials: "same-origin", cache: "no-store" });
    if (res.status === 401) {
      return { ok: false, message: "클라우드에 연결하려면 Cursor 로그인이 필요합니다.", mergedGames: local.games.length };
    }
    if (!res.ok) {
      return { ok: false, message: "클라우드에 잠시 연결하지 못했습니다. 로컬 기록은 그대로입니다.", mergedGames: local.games.length };
    }
    const data = (await res.json()) as { payload?: VaultPayload };
    remote = data.payload ?? null;
  } catch {
    return { ok: false, message: "오프라인이거나 서버에 닿지 않습니다. 로컬 기록은 그대로입니다.", mergedGames: local.games.length };
  }

  const merged = remote ? mergeVaults(local, remote) : local;
  await applyVault(merged);

  try {
    const put = await fetch("/api/vault", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ payload: merged }),
    });
    if (!put.ok) {
      return {
        ok: false,
        message: "클라우드에 올리는 데 실패했습니다. 이 브라우저 기록은 그대로입니다.",
        mergedGames: merged.games.length,
      };
    }
    const saved = (await put.json().catch(() => null)) as { payload?: VaultPayload } | null;
    if (saved?.payload) await applyVault(saved.payload);
  } catch {
    return {
      ok: false,
      message: "클라우드에 올리는 데 실패했습니다. 이 브라우저 기록은 그대로입니다.",
      mergedGames: merged.games.length,
    };
  }

  await idbPut("meta", { key: "lastCloudSyncAt", value: new Date().toISOString() } satisfies Meta);
  return { ok: true, message: "클라우드와 기록이 맞춰졌습니다.", mergedGames: merged.games.length };
}

export async function syncCloudQuietly() {
  try {
    await syncCloudVault();
  } catch {
    // Never throw into UI — local IndexedDB remains the source of truth on failure.
  }
}

export { mergeVaults };
