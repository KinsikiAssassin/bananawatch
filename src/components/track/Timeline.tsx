"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { RIPENESS_CONFIG } from "@/lib/ai-prompts";
import type { RipenessStage } from "@/types";

type TimelineScan = {
  id: string;
  createdAt: string; // ISO string (serialized from server)
  ripenessPercent: number;
  stage: RipenessStage;
  imageUrl: string;
  delta: number | null; // change from previous scan
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function Timeline({ scans }: { scans: TimelineScan[] }) {
  const router = useRouter();

  if (scans.length === 0) {
    return <p className="py-4 text-center text-sm text-gray-400">No scans yet</p>;
  }

  return (
    <div className="flex flex-col">
      {scans.map((scan, i) => {
        const config = RIPENESS_CONFIG[scan.stage];
        const isLast = i === scans.length - 1;
        return (
          <div key={scan.id} className="flex gap-3">
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <div
                className="mt-3 h-3 w-3 shrink-0 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: config.ringColor }}
              />
              {!isLast && <div className="w-0.5 flex-1 bg-amber-100" />}
            </div>

            {/* Card */}
            <button
              onClick={() => router.push(`/result/${scan.id}`)}
              className="mb-3 flex flex-1 items-center gap-3 rounded-2xl bg-white p-3 shadow-sm transition active:scale-[0.98] text-left"
            >
              {/* Thumbnail */}
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-amber-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={scan.imageUrl}
                  alt="Banana scan"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Info */}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", config.badgeColor)}>
                    {config.emoji} {config.label}
                  </span>
                  <span className="text-lg font-bold tabular-nums" style={{ color: config.ringColor }}>
                    {scan.ripenessPercent}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatDate(scan.createdAt)}</span>
                  {scan.delta !== null && (
                    <span className={cn("font-semibold", scan.delta > 0 ? "text-orange-400" : "text-green-500")}>
                      {scan.delta > 0 ? `+${scan.delta}%` : `${scan.delta}%`}
                    </span>
                  )}
                </div>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
