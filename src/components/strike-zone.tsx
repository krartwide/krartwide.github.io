"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { armSlotLabel, armSlotOption, releasePointForSlot, slotBreakBias } from "@/lib/arm-slot";
import { pitchDef } from "@/lib/pitch-catalog";
import { pitchRpm } from "@/lib/pitch-metrics";
import type { PitchEvent } from "@/lib/types";

const CALL_COLOR: Record<string, string> = {
  ball: "#8d8474",
  called_strike: "#c9842a",
  swinging_strike: "#c23b2e",
  foul: "#2f7d4a",
  in_play: "#f7f1e4",
  hbp: "#d36a1e",
};

type Point = { x: number; y: number };

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function px(x: number) {
  return 110 + x * 78;
}

function py(y: number) {
  return 36 + (1 - y) * 176;
}

function sampleQuadratic(a: Point, b: Point, c: Point, steps = 40): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const u = 1 - t;
    pts.push({
      x: u * u * a.x + 2 * u * t * b.x + t * t * c.x,
      y: u * u * a.y + 2 * u * t * b.y + t * t * c.y,
    });
  }
  return pts;
}

function pathFromPoints(pts: Point[]) {
  if (pts.length === 0) return "";
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
}

/** Release → plate path with pitch-type break for a catcher's-eye view. */
function buildPitchFlight(pitch: PitchEvent) {
  const end = { x: px(pitch.x), y: py(pitch.y) };
  const throws = pitch.throws ?? "R";
  const release = releasePointForSlot(pitch.armSlot, throws);
  const slotBias = slotBreakBias(pitch.armSlot);
  const side = throws === "L" ? -1 : 1;

  const def = pitchDef(pitch.code);
  const base = def?.break ?? { x: 3, y: 4 };
  // Mirror horizontal break toward the arm side / glove side from catcher's view.
  const breakX =
    def?.family === "breaking" || def?.family === "specialty"
      ? (pitch.x >= 0 ? 1 : -1) * Math.abs(base.x)
      : def?.family === "fastball" && (pitch.code === "si" || pitch.code === "ft" || pitch.code === "su")
        ? (pitch.x >= 0 ? -1 : 1) * Math.abs(base.x)
        : pitch.x * Math.min(8, Math.abs(base.x));
  const breakY = base.y;

  // Low slots start near/below the zone — keep underhand nearly linear so it
  // does not read as a hooked three-quarter tunnel.
  const family = armSlotOption(pitch.armSlot).family;
  const breakScale =
    family === "underhand" ? 0.12 : family === "sidearm" ? 0.4 : family === "three_quarter" ? 0.75 : 1;
  const midT = family === "underhand" ? 0.5 : 0.55;

  const mid = {
    x: release.x + (end.x - release.x) * midT + breakX * breakScale + slotBias.x * side,
    y: release.y + (end.y - release.y) * midT + breakY * breakScale + slotBias.y,
  };

  const points = sampleQuadratic(release, mid, end);
  // ~18.44 m to the plate; stretch a little so the flight is readable.
  const mps = Math.max(pitch.velo, 90) / 3.6;
  const seconds = clamp((18.44 / mps) * 1.55, 0.45, 1.35);

  return {
    release,
    end,
    points,
    path: pathFromPoints(points),
    durationMs: Math.round(seconds * 1000),
    rpm: pitchRpm(pitch),
  };
}

export function StrikeZone({
  pitches,
  activeId,
  onSelect,
}: {
  pitches: PitchEvent[];
  activeId?: string;
  onSelect?: (pitch: PitchEvent) => void;
}) {
  const active = pitches.find((p) => p.id === activeId) ?? null;
  const flight = useMemo(() => (active ? buildPitchFlight(active) : null), [active]);
  const [progress, setProgress] = useState(1);
  const [playing, setPlaying] = useState(false);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (!flight || !active) {
      setProgress(1);
      setPlaying(false);
      return;
    }
    if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    if (reducedMotion.current) {
      setProgress(1);
      setPlaying(false);
      return;
    }

    setProgress(0);
    setPlaying(true);
    startRef.current = performance.now();

    const tick = (now: number) => {
      const t = clamp((now - startRef.current) / flight.durationMs, 0, 1);
      const eased = 1 - (1 - t) * (1 - t);
      setProgress(eased);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setPlaying(false);
        frameRef.current = null;
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    };
  }, [flight, active?.id]);

  function replay() {
    if (!flight || !active) return;
    if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    if (reducedMotion.current) {
      setProgress(1);
      setPlaying(false);
      return;
    }
    setProgress(0);
    setPlaying(true);
    startRef.current = performance.now();
    const tick = (now: number) => {
      const t = clamp((now - startRef.current) / flight.durationMs, 0, 1);
      const eased = 1 - (1 - t) * (1 - t);
      setProgress(eased);
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
      else {
        setPlaying(false);
        frameRef.current = null;
      }
    };
    frameRef.current = requestAnimationFrame(tick);
  }

  const idx = flight ? Math.min(flight.points.length - 1, Math.round(progress * (flight.points.length - 1))) : 0;
  const ballPos = flight?.points[idx] ?? { x: 110, y: 18 };
  const traveled = flight ? pathFromPoints(flight.points.slice(0, idx + 1)) : "";

  return (
    <div className="grid gap-1.5">
      <div className="relative w-full max-w-[280px]">
        <svg viewBox="0 0 220 250" className="w-full" role="img" aria-label="스트라이크 존과 투구 궤적">
          <rect
            x="8"
            y="8"
            width="204"
            height="234"
            rx="12"
            fill="#1b3a2c"
            className="cursor-pointer"
            onClick={replay}
          />
          <rect
            x={px(-0.5)}
            y={py(0.74)}
            width={px(0.5) - px(-0.5)}
            height={py(0.28) - py(0.74)}
            fill="none"
            stroke="#f4efe2"
            strokeWidth="1.6"
            className="pointer-events-none"
          />
          <path d="M92 214h36l-6 14h-24z" fill="#f4efe2" className="pointer-events-none" />

          {/* Resting dots for other pitches */}
          {pitches.map((pitch) => {
            if (pitch.id === activeId) return null;
            return (
              <g
                key={pitch.id}
                onClick={() => onSelect?.(pitch)}
                className={onSelect ? "cursor-pointer" : undefined}
                opacity={0.45}
              >
                <circle
                  cx={px(pitch.x)}
                  cy={py(pitch.y)}
                  r={5.5}
                  fill={CALL_COLOR[pitch.call] ?? "#ddd"}
                  stroke="#10241b"
                  strokeWidth={1}
                />
                <text x={px(pitch.x)} y={py(pitch.y) + 3} textAnchor="middle" fontSize="7" fill="#1b3a2c" fontWeight="700">
                  {pitch.number}
                </text>
              </g>
            );
          })}

          {flight && (
            <g className="cursor-pointer" onClick={replay}>
              <path
                d={flight.path}
                fill="none"
                stroke="#f2d48a"
                strokeWidth="2.2"
                strokeLinecap="round"
                opacity="0.2"
              />
              <path
                d={flight.path}
                fill="none"
                stroke="#f4efe2"
                strokeWidth="1.1"
                strokeDasharray="3 6"
                strokeLinecap="round"
                opacity="0.32"
              />
              {traveled && (
                <path
                  d={traveled}
                  fill="none"
                  stroke="#f2d48a"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity={playing ? 0.55 : 0.26}
                />
              )}
              <circle cx={flight.release.x} cy={flight.release.y} r="3" fill="#f4efe2" opacity="0.55" />
              <circle
                cx={ballPos.x}
                cy={ballPos.y}
                r={playing ? 8 : 7}
                fill={CALL_COLOR[active?.call ?? ""] ?? "#f4efe2"}
                stroke={active?.call === "in_play" ? "#c23b2e" : "#10241b"}
                strokeWidth={2.2}
              />
              {!playing && active && (
                <text x={ballPos.x} y={ballPos.y + 3} textAnchor="middle" fontSize="8" fill="#1b3a2c" fontWeight="700">
                  {active.number}
                </text>
              )}
            </g>
          )}
        </svg>
      </div>
      {active && flight && (
        <p className="text-[11px] leading-4 text-muted-foreground">
          {armSlotLabel(active.armSlot)} · {active.velo}km · {flight.rpm.toLocaleString("ko-KR")} rpm
          {playing ? " · 비행 중" : " · 존을 탭하면 다시 날림"}
        </p>
      )}
    </div>
  );
}
