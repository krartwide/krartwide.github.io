import type { GameRecord, Team } from "@/lib/types";
import { emptyVault, type VaultPayload } from "@/lib/vault-types";

const DELETED_CAP = 400;

function mergeDeletedIds(...lists: (string[] | undefined)[]): string[] {
  const ids = new Set<string>();
  for (const list of lists) {
    for (const id of list ?? []) {
      if (typeof id === "string" && id) ids.add(id);
    }
  }
  return [...ids].slice(0, DELETED_CAP);
}

/** Union vaults without dropping local-only games; respect deletion tombstones. */
export function mergeVaults(a: VaultPayload, b: VaultPayload): VaultPayload {
  const deletedGameIds = mergeDeletedIds(a.deletedGameIds, b.deletedGameIds);
  const deleted = new Set(deletedGameIds);

  const games = new Map<string, GameRecord>();
  for (const game of [...(a.games ?? []), ...(b.games ?? [])]) {
    if (!game?.id || deleted.has(game.id)) continue;
    const prev = games.get(game.id);
    if (!prev || game.createdAt >= prev.createdAt) games.set(game.id, game);
  }
  const teams = new Map<string, Team>();
  for (const team of [...(a.teams ?? []), ...(b.teams ?? [])]) {
    if (!team?.id || team.canonical) continue;
    teams.set(team.id, team);
  }
  const achievements = new Map<string, { key: string; earnedAt: string }>();
  for (const row of [...(a.achievements ?? []), ...(b.achievements ?? [])]) {
    if (!row?.key || !row.earnedAt) continue;
    const prev = achievements.get(row.key);
    if (!prev || row.earnedAt >= prev.earnedAt) achievements.set(row.key, row);
  }
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    games: [...games.values()].sort((x, y) => y.createdAt.localeCompare(x.createdAt)).slice(0, 120),
    teams: [...teams.values()].slice(0, 80),
    achievements: [...achievements.values()].slice(0, 40),
    deletedGameIds,
  };
}

export function normalizeVault(raw: unknown): VaultPayload {
  if (!raw || typeof raw !== "object") return emptyVault();
  const data = raw as VaultPayload;
  if (data.version !== 1) return emptyVault();
  const deletedGameIds = mergeDeletedIds(data.deletedGameIds);
  const deleted = new Set(deletedGameIds);
  return {
    version: 1,
    updatedAt: data.updatedAt || new Date(0).toISOString(),
    games: (Array.isArray(data.games) ? data.games : []).filter((game) => game?.id && !deleted.has(game.id)),
    teams: Array.isArray(data.teams) ? data.teams : [],
    achievements: Array.isArray(data.achievements) ? data.achievements : [],
    deletedGameIds,
  };
}

export function parseVaultJson(raw: string): VaultPayload {
  try {
    return normalizeVault(JSON.parse(raw));
  } catch {
    return emptyVault();
  }
}
