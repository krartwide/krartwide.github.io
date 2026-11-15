import researched from "@/data/researched-arsenals.json";
import { normalizeArsenal, type PitchArsenalEntry } from "@/lib/pitch-catalog";

let cache: Record<string, PitchArsenalEntry[]> | null = null;

function table(): Record<string, PitchArsenalEntry[]> {
  if (cache) return cache;
  cache = {};
  for (const [name, arsenal] of Object.entries(researched as Record<string, PitchArsenalEntry[]>)) {
    const normalized = normalizeArsenal(arsenal);
    if (normalized.length) cache[name] = normalized;
  }
  return cache;
}

/** Documented public-club arsenals (야구나라 / articles / historical writeups). */
export function knownArsenal(name: string): PitchArsenalEntry[] | undefined {
  return table()[name];
}
