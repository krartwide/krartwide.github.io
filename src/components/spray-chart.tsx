"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BattedBall } from "@/lib/types";

type Point = { x: number; y: number };

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function sampleQuadratic(home: Point, mid: Point, end: Point, steps = 48): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const u = 1 - t;
    pts.push({
      x: u * u * home.x + 2 * u * t * mid.x + t * t * end.x,
      y: u * u * home.y + 2 * u * t * mid.y + t * t * end.y,
    });
  }
  return pts;
}

function pathFromPoints(pts: Point[]) {
  if (pts.length === 0) return "";
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
}

function buildFlight(ball: BattedBall) {
  const home = { x: 160, y: 248 };
  const rad = (ball.angle * Math.PI) / 180;
  const plotDist = Math.min(ball.distance, 140) * 1.45;
  const end = {
    x: 160 + Math.sin(rad) * plotDist,
    y: 248 - Math.cos(rad) * plotDist,
  };

  // Apex rises with launch angle; line drives stay flatter.
  const apexT = clamp(0.42 + ball.la / 220, 0.34, 0.58);
  const along = plotDist * apexT;
  const lift = clamp(ball.la * 2.05 + ball.distance * 0.12, 10, 92);
  const mid = {
    x: 160 + Math.sin(rad) * along,
    y: 248 - Math.cos(rad) * along - lift,
  };

  const points = sampleQuadratic(home, mid, end);
  // Flight time from exit velo (km/h) and distance (m); keep watchable.
  const mps = Math.max(ball.ev, 40) / 3.6;
  const seconds = clamp(ball.distance / mps, 0.55, 3.2);

  return {
    home,
    mid,
    end,
    points,
    path: pathFromPoints(points),
    durationMs: Math.round(seconds * 1000),
  };
}

export function SprayChart({ ball }: { ball: BattedBall }) {
  const flight = useMemo(() => buildFlight(ball), [ball]);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
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
      // Ease out slightly so the ball settles into the landing.
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
  }, [flight]);

  function replay() {
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
  }

  const idx = Math.min(flight.points.length - 1, Math.round(progress * (flight.points.length - 1)));
  const ballPos = flight.points[idx] ?? flight.home;
  // Ghost trail: portion of path already traveled, drawn softer behind the ball.
  const traveled = pathFromPoints(flight.points.slice(0, idx + 1));

  return (
    <button
      type="button"
      onClick={replay}
      className="block w-full cursor-pointer rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-[#f2d48a]/60"
      aria-label="타구 궤적 다시 보기"
      title="다시 날리기"
    >
      <svg viewBox="0 0 320 280" className="w-full" role="img" aria-label="타구 궤적">
        <rect width="320" height="280" rx="12" fill="#1b3a2c" />
        <path d="M160 248 L28 70 A150 150 0 0 1 292 70 Z" fill="#24563a" />
        <path d="M160 248 L70 150 A70 70 0 0 1 250 150 Z" fill="#c6a15a" opacity="0.85" />
        <path d="M160 248 L28 70" stroke="#f4efe2" strokeWidth="1.2" />
        <path d="M160 248 L292 70" stroke="#f4efe2" strokeWidth="1.2" />
        <path d="M92 214h36l-6 14h-24z" fill="#f4efe2" transform="translate(50 20)" />

        {/* Full faint trajectory ghost */}
        <path
          d={flight.path}
          fill="none"
          stroke="#f2d48a"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.22"
        />
        <path
          d={flight.path}
          fill="none"
          stroke="#f4efe2"
          strokeWidth="1.2"
          strokeDasharray="3 7"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* Already-flown segment a bit clearer while moving */}
        {traveled && (
          <path
            d={traveled}
            fill="none"
            stroke="#f2d48a"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity={playing ? 0.55 : 0.28}
          />
        )}

        <circle cx={flight.home.x} cy={flight.home.y} r="3.5" fill="#f4efe2" opacity="0.7" />
        <circle
          cx={ballPos.x}
          cy={ballPos.y}
          r={playing ? 8 : 7}
          fill="#f4efe2"
          stroke="#c23b2e"
          strokeWidth="2"
        />

        <text x="16" y="24" fill="#f4efe2" fontSize="12">
          {ball.direction} · {ball.distance}m · {ball.ev}km
        </text>
        <text x="16" y="42" fill="#d9c7a2" fontSize="11">
          발사각 {ball.la}° · {ball.resultLabel}
          {playing ? " · 비행 중" : " · 탭하면 다시 날림"}
        </text>
      </svg>
    </button>
  );
}
