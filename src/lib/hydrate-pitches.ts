import { defaultArmSlot, isArmSlot, KNOWN_ARM_SLOTS, type ArmSlot } from "@/lib/arm-slot";
import type { GameRecord, Player, Team, Throws } from "@/lib/types";

type PitcherMeta = { armSlot: ArmSlot; throws: Throws };

function indexPlayers(teams: Team[]) {
  const byId = new Map<string, Player>();
  const byName = new Map<string, Player>();
  for (const team of teams) {
    for (const player of team.players) {
      if (player.kind !== "P") continue;
      byId.set(player.id, player);
      if (player.sourceId) byId.set(player.sourceId, player);
      if (!byName.has(player.name)) byName.set(player.name, player);
    }
  }
  return { byId, byName };
}

function metaFor(pitcherId: string, pitcherName: string, index: ReturnType<typeof indexPlayers>): PitcherMeta {
  const player = index.byId.get(pitcherId) ?? index.byName.get(pitcherName);
  const name = player?.name ?? pitcherName;
  const throws: Throws = player?.throws === "L" ? "L" : player?.throws === "R" ? "R" : "R";
  // Documented deliveries always win so corrected public-club forms rewrite old pitch logs.
  const known = KNOWN_ARM_SLOTS[name];
  const armSlot =
    known ??
    (player && isArmSlot(player.armSlot) ? player.armSlot : undefined) ??
    defaultArmSlot(name, throws);
  return { armSlot, throws: player?.throws ?? throws };
}

/** Align pitch armSlot/throws with the current roster (rewrites outdated deliveries). */
export function hydrateGameArmSlots(game: GameRecord, teams: Team[]): { game: GameRecord; changed: boolean } {
  const index = indexPlayers(teams);
  let changed = false;

  const plays = game.plays.map((play) => {
    if (!play.pitches?.length) return play;
    const meta = metaFor(play.pitcherId, play.pitcherName, index);
    let playChanged = false;
    const pitches = play.pitches.map((pitch) => {
      // Always prefer current roster / known delivery so corrected forms rewrite old pitch logs.
      const nextSlot = meta.armSlot;
      const nextThrows: Throws = pitch.throws === "L" || pitch.throws === "R" ? pitch.throws : meta.throws;
      if (pitch.armSlot === nextSlot && pitch.throws === nextThrows) return pitch;
      playChanged = true;
      changed = true;
      return { ...pitch, armSlot: nextSlot, throws: nextThrows };
    });
    return playChanged ? { ...play, pitches } : play;
  });

  return changed ? { game: { ...game, plays }, changed } : { game, changed: false };
}
