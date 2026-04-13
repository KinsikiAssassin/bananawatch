"use client";

import { useEffect, useState } from "react";
import type { RipenessStage } from "@/types";
import { RIPENESS_CONFIG } from "@/lib/ai-prompts";

type RipenessRingProps = {
  percent: number;
  stage: RipenessStage;
};

const SIZE = 160;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

export function RipenessRing({ percent, stage }: RipenessRingProps) {
  const [animated, setAnimated] = useState(false);
  const config = RIPENESS_CONFIG[stage];

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

  const offset = animated ? CIRC * (1 - percent / 100) : CIRC;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={SIZE}
        height={SIZE}
        style={{ transform: "rotate(-90deg)" }}
        aria-label={`Ripeness: ${percent}%`}
      >
        {/* track */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={STROKE}
        />
        {/* progress */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={config.ringColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-tight">
        <span className="text-4xl font-bold text-gray-800">{percent}</span>
        <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400">
          %
        </span>
      </div>
    </div>
  );
}
