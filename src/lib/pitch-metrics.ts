/** Typical spin bands (RPM) by pitch code — used for new sims and older saves without rpm. */
const RPM_BASE: Record<string, [number, number]> = {
  ff: [2100, 2450],
  ft: [1900, 2300],
  si: [1800, 2250],
  ct: [2200, 2600],
  sl: [2300, 2900],
  cb: [2400, 3100],
  ch: [1500, 2000],
  sp: [1200, 1700],
  fo: [1100, 1650],
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/** Deterministic-looking RPM from code + velo when a stored value is missing. */
export function estimateRpm(code: string, velo: number, jitter = 0.5): number {
  const [lo, hi] = RPM_BASE[code] ?? [1800, 2400];
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
  const [lo, hi] = RPM_BASE[code] ?? [1800, 2400];
  const base = lo + rng() * (hi - lo);
  const veloTilt = clamp((velo - 135) * 6, -120, 140);
  return Math.round(clamp(base + veloTilt + (rng() - 0.5) * 90, lo - 60, hi + 100));
}
