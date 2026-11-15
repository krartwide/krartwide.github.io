import researched from "@/data/researched-arsenals.json";
import { normalizeArsenal, type PitchArsenalEntry } from "@/lib/pitch-catalog";

/** Documented public-club arsenals (야구나라 / articles / historical writeups). */
export const KNOWN_ARSENALS: Record<string, PitchArsenalEntry[]> = Object.fromEntries(
  Object.entries(researched as Record<string, PitchArsenalEntry[]>).map(([name, arsenal]) => [
    name,
    normalizeArsenal(arsenal),
  ]),
);

export function knownArsenal(name: string): PitchArsenalEntry[] | undefined {
  const arsenal = KNOWN_ARSENALS[name];
  return arsenal?.length ? arsenal : undefined;
}
