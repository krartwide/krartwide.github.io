import type { GameRecord, Team } from "@/lib/types";
import { emptyVault, type VaultPayload } from "@/lib/vault-types";

/** Union vaults without dropping local-only games. */
export function mergeVaults(a: VaultPayload, b: VaultPayload): VaultPayload {
  const games = new Map<string, GameRecord>();
  for (const game of [...(a.games ?? []), ...(b.games ?? [])]) {
    if (!game?.id) continue;
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
  };
}

export function normalizeVault(raw: unknown): VaultPayload {
  if (!raw || typeof raw !== "object") return emptyVault();
  const data = raw as VaultPayload;
  if (data.version !== 1) return emptyVault();
  return {
    version: 1,
    updatedAt: data.updatedAt || new Date(0).toISOString(),
    games: Array.isArray(data.games) ? data.games : [],
    teams: Array.isArray(data.teams) ? data.teams : [],
    achievements: Array.isArray(data.achievements) ? data.achievements : [],
  };
}

export function parseVaultJson(raw: string): VaultPayload {
  try {
    return normalizeVault(JSON.parse(raw));
  } catch {
    return emptyVault();
  }
}
