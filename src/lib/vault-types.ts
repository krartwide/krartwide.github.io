import type { GameRecord, Team } from "@/lib/types";

export type VaultPayload = {
  version: 1;
  updatedAt: string;
  games: GameRecord[];
  teams: Team[];
  achievements: { key: string; earnedAt: string }[];
  /** Tombstones so a deleted game is not resurrected by cloud merge. */
  deletedGameIds?: string[];
};

export function emptyVault(): VaultPayload {
  return {
    version: 1,
    updatedAt: new Date(0).toISOString(),
    games: [],
    teams: [],
    achievements: [],
    deletedGameIds: [],
  };
}
