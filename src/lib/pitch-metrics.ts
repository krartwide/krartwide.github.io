import { pitchDef } from "@/lib/pitch-catalog";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function rpmBand(code: string): [number, number] {
  return pitchDef(code)?.rpm ?? [1800, 2400];
}

/** Deterministic-looking RPM from code + velo when a stored value is missing. */
export function estimateRpm(code: string, velo: number, jitter = 0.5): number {
  const [lo, hi] = rpmBand(code);
  const mid = (lo + hi) / 2;
  // Harder heaters tend to carry a bit more spin; soft toss a bit less.
  const veloTilt = clamp((velo - 135) * 6, -120, 140);
  const spread = (hi - lo) * (jitter - 0.5);
  return Math.round(clamp(mid + veloTilt + spread, lo - 80, hi + 120));
}

export function pitchRpm(pitch: { code: string; velo: number; rpm?: number }): number {
  if (typeof pitch.rpm === "number" && pitch.rpm > 0) return Math.round(pitch.rpm);
  // Stable per pitch: hash code+velo into 0..1 jitter so old saves don't flicker.
  const key = `${pitch.code}:${pitch.velo}`;
  let h = 0;
  for (let i = 0; i < key.length; i += 1) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  const jitter = (h % 1000) / 1000;
  return estimateRpm(pitch.code, pitch.velo, jitter);
}

/** Sample RPM when creating a new pitch in the sim. */
export function rollRpm(code: string, velo: number, rng: () => number): number {
  const [lo, hi] = rpmBand(code);
  const base = lo + rng() * (hi - lo);
  const veloTilt = clamp((velo - 135) * 6, -120, 140);
  return Math.round(clamp(base + veloTilt + (rng() - 0.5) * 90, lo - 60, hi + 100));
}
