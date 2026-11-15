"use client";

import canonicalRaw from "@/data/canonical-teams.json";
import { ACHIEVEMENT_CATALOG, type AchievementKey } from "@/lib/achievement-catalog";
import { defaultArmSlot } from "@/lib/arm-slot";
import { idbDelete, idbGet, idbGetAll, idbPut } from "@/lib/browser-db";
import { rememberDeletedGameId, removeDeletedGameId } from "@/lib/deleted-games";
import { newId, rosterIssues } from "@/lib/stats";
import type { GameRecord, Player, SeriesFormat, SeriesRecord, Team, VenueMode } from "@/lib/types";

export const LOCAL_OWNER_ID = "browser-solo";
export const LOCAL_OWNER_NAME = "다이아리";

const canonicalTeams = canonicalRaw as Team[];
const GAME_CAP = 120;

type LocalAchievement = { key: string; earnedAt: string };

function withCanonicalFlag(team: Team): Team {
  return { ...team, canonical: true, visibility: "public", ownerId: null };
}

/** Keep local logo/color edits while refreshing bundled pitcher arm slots. */
function mergePlayers(canon: Player[], override: Player[] | undefined): Player[] {
  if (!override?.length) {
    return canon.map((player) =>
      player.kind === "P" ? { ...player, armSlot: player.armSlot ?? defaultArmSlot(player.name, player.throws) } : player,
    );
  }
  const byId = new Map(override.map((player) => [player.id, player]));
  const bySource = new Map(
    override.filter((player) => player.sourceId).map((player) => [player.sourceId!, player]),
  );
  const merged = canon.map((player) => {
    const local = byId.get(player.id) ?? (player.sourceId ? bySource.get(player.sourceId) : undefined);
    if (!local) {
      return player.kind === "P" ? { ...player, armSlot: player.armSlot ?? defaultArmSlot(player.name, player.throws) } : player;
    }
    return {
      ...player,
      ...local,
      armSlot: local.armSlot ?? player.armSlot ?? (player.kind === "P" ? defaultArmSlot(player.name, player.throws) : undefined),
      batter: local.batter ?? player.batter,
      pitcher: local.pitcher ?? player.pitcher,
      positions: local.positions?.length ? local.positions : player.positions,
    };
  });
  const canonIds = new Set(canon.map((player) => player.id));
  const extras = override.filter((player) => !canonIds.has(player.id));
  return [...merged, ...extras];
}

function mergeTeams(stored: Team[]): Team[] {
  const byId = new Map(stored.map((team) => [team.id, team]));
  const canon = canonicalTeams.map((team) => {
    const base = withCanonicalFlag(team);
    const override = byId.get(team.id);
    if (!override) return base;
    // User logo/color edits on public clubs live in IndexedDB — never wipe them.
    return {
      ...base,
      ...override,
      canonical: true,
      visibility: "public" as const,
      ownerId: null,
      logo: override.logo !== undefined ? override.logo : base.logo,
      primary: override.primary || base.primary,
      secondary: override.secondary || base.secondary,
      players: mergePlayers(base.players, override.players),
    };
  });
  const custom = stored.filter((team) => !canonicalTeams.some((item) => item.id === team.id));
  return [...canon, ...custom];
}

/** Bundled clubs only — safe to call during first paint without IndexedDB. */
export function listBundledTeams(): Team[] {
  return mergeTeams([]);
}

export async function listLocalTeams(): Promise<Team[]> {
  let stored: Team[] = [];
  try {
    stored = await idbGetAll<Team>("teams");
  } catch {
    // IndexedDB unavailable — still show bundled canonical clubs.
  }
  return mergeTeams(stored);
}

export async function findLocalTeam(id: string): Promise<Team | null> {
  const teams = await listLocalTeams();
  return teams.find((team) => team.id === id) ?? null;
}

export async function saveLocalTeam(team: Team) {
  const payload: Team = {
    ...team,
    name: team.name.trim(),
    ownerId: LOCAL_OWNER_ID,
  };
  await idbPut("teams", payload);
  if (team.visibility === "public" && !team.canonical) {
    await grantLocalAchievement("public_team");
  }
  void import("@/lib/cloud-sync").then((mod) => mod.syncCloudQuietly());
  return payload;
}

export async function deleteLocalTeam(id: string) {
  const existing = await idbGet<Team>("teams", id);
  if (!existing) {
    // Canonical with no override — nothing to delete.
    const isCanon = canonicalTeams.some((team) => team.id === id);
    return isCanon;
  }
  await idbDelete("teams", id);
  return true;
}

export async function duplicateLocalTeam(id: string) {
  const team = await findLocalTeam(id);
  if (!team) throw new Error("팀을 찾지 못했습니다.");
  const copy: Team = {
    ...structuredClone(team),
    id: newId("team"),
    name: `${team.name} 복제`,
    canonical: false,
    visibility: "private",
    ownerId: LOCAL_OWNER_ID,
    createdAt: new Date().toISOString(),
  };
  await saveLocalTeam(copy);
  return copy;
}

export async function listLocalGames(): Promise<GameRecord[]> {
  const games = await idbGetAll<GameRecord>("games");
  return games.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findLocalGame(id: string): Promise<GameRecord | null> {
  const game = await idbGet<GameRecord>("games", id);
  if (!game) return null;
  const teams = await listLocalTeams();
  const { hydrateGameArmSlots } = await import("@/lib/hydrate-pitches");
  const { game: hydrated, changed } = hydrateGameArmSlots(game, teams);
  if (changed) {
    // Persist quietly so old records keep the form on later opens / sync.
    await idbPut("games", hydrated);
    void import("@/lib/cloud-sync").then((mod) => mod.syncCloudQuietly());
  }
  return hydrated;
}

/** Backfill arm slots onto every saved game that still lacks them. */
export async function backfillGameArmSlots(): Promise<number> {
  const teams = await listLocalTeams();
  const { hydrateGameArmSlots } = await import("@/lib/hydrate-pitches");
  const games = await idbGetAll<GameRecord>("games");
  let updated = 0;
  for (const game of games) {
    const { game: hydrated, changed } = hydrateGameArmSlots(game, teams);
    if (!changed) continue;
    await idbPut("games", hydrated);
    updated += 1;
  }
  if (updated > 0) {
    void import("@/lib/cloud-sync").then((mod) => mod.syncCloudQuietly());
  }
  return updated;
}

export async function saveLocalGame(game: GameRecord) {
  const payload = { ...game, ownerId: LOCAL_OWNER_ID };
  await idbPut("games", payload);
  // Saving again clears a prior delete tombstone for this id.
  await removeDeletedGameId(payload.id);
  const games = await listLocalGames();
  if (games.length > GAME_CAP) {
    const overflow = games.slice(GAME_CAP);
    for (const old of overflow) await idbDelete("games", old.id);
  }
  await awardLocalGameAchievements(payload);
  void import("@/lib/cloud-sync").then((mod) => mod.syncCloudQuietly());
  return payload;
}

/** Delete a game from this browser. Tombstone keeps cloud merge from restoring it. */
export async function deleteLocalGame(id: string) {
  await idbDelete("games", id);
  await rememberDeletedGameId(id);
  void import("@/lib/cloud-sync").then((mod) => mod.syncCloudQuietly());
  return true;
}

export async function playLocalSeries(input: {
  awayId: string;
  homeId: string;
  awayStarterId?: string;
  homeStarterId?: string;
  series?: SeriesFormat;
  homeAdvantage?: boolean;
  innings?: 7 | 9;
  venue?: VenueMode;
}): Promise<SeriesRecord> {
  const away = await findLocalTeam(input.awayId);
  const home = await findLocalTeam(input.homeId);
  if (!away || !home) throw new Error("팀을 찾지 못했습니다.");
  const awayIssue = rosterIssues(away)[0];
  const homeIssue = rosterIssues(home)[0];
  if (awayIssue || homeIssue) {
    throw new Error(`${awayIssue ? away.name : home.name}: ${awayIssue ?? homeIssue}`);
  }
  const { simulateSeries } = await import("@/lib/modes");
  const record = simulateSeries(away, home, {
    ownerId: LOCAL_OWNER_ID,
    series: input.series,
    homeAdvantage: input.homeAdvantage,
    innings: input.innings,
    venue: input.venue,
    awayStarterId: input.awayStarterId,
    homeStarterId: input.homeStarterId,
  });
  for (const game of record.games) {
    await saveLocalGame(game);
  }
  return record;
}

async function grantLocalAchievement(key: AchievementKey) {
  const existing = await idbGet<LocalAchievement>("achievements", key);
  if (existing) return;
  await idbPut("achievements", { key, earnedAt: new Date().toISOString() });
}

async function awardLocalGameAchievements(game: GameRecord) {
  const games = await listLocalGames();
  await grantLocalAchievement("first_game");
  if (game.linescore.awayR !== game.linescore.homeR) await grantLocalAchievement("first_win");
  if (game.walkOff) await grantLocalAchievement("walkoff");
  if (game.completeGame?.shutout) await grantLocalAchievement("shutout");
  if (game.completeGame) await grantLocalAchievement("complete_game");
  if (Math.max(game.linescore.away.length, game.linescore.home.length) >= 10) await grantLocalAchievement("extras");
  if (game.decisions.save) await grantLocalAchievement("save");
  if (games.length >= 10) await grantLocalAchievement("ten_games");
}

export async function listLocalAchievements() {
  const earned = await idbGetAll<LocalAchievement>("achievements");
  const map = new Map(earned.map((row) => [row.key, row.earnedAt]));
  return ACHIEVEMENT_CATALOG.map((item) => ({
    ...item,
    earnedAt: map.get(item.key) ?? null,
  }));
}
