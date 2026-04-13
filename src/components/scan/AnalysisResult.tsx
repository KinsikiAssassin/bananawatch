"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ScanLine, BookmarkPlus, ChevronRight } from "lucide-react";
import { RipenessRing } from "@/components/scan/RipenessRing";
import { createTracker } from "@/actions/scan";
import { RIPENESS_CONFIG } from "@/lib/ai-prompts";
import { cn } from "@/lib/utils";
import type { RipenessStage } from "@/types";

type Scan = {
  id: string;
  imageUrl: string;
  ripenessPercent: number;
  stage: RipenessStage;
  daysUntilSpoiled: number | null;
  color: string | null;
  recommendation: string;
  recipe: string | null;
  trackerId: string | null;
};

export function AnalysisResult({ scan }: { scan: Scan }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tracked, setTracked] = useState(!!scan.trackerId);
  const config = RIPENESS_CONFIG[scan.stage];

  const handleTrack = () => {
    startTransition(async () => {
      const result = await createTracker({ scanId: scan.id });
      if (result.success) {
        setTracked(true);
        toast.success("Banana tracker created!");
        router.push(`/track/${result.data.trackerId}`);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-5 px-4 py-5">
      {/* Banana image */}
      <div className="overflow-hidden rounded-3xl shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={scan.imageUrl}
          alt="Analyzed banana"
          className="h-48 w-full object-cover"
        />
      </div>

      {/* Ripeness ring + stage badge */}
      <div className={cn("flex flex-col items-center gap-4 rounded-3xl py-6", config.bgColor)}>
        <RipenessRing percent={scan.ripenessPercent} stage={scan.stage} />
        <div className="flex flex-col items-center gap-2">
          <span
            className={cn(
              "rounded-full px-4 py-1 text-sm font-bold tracking-wide",
              config.badgeColor
            )}
          >
            {config.emoji} {config.label}
          </span>
          <p className="text-center text-xs text-gray-500 px-6">{config.tip}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {scan.daysUntilSpoiled !== null && (
          <StatCard
            label="Days Left"
            value={scan.daysUntilSpoiled === 0 ? "Today!" : `${scan.daysUntilSpoiled} days`}
            emoji="📅"
            urgent={scan.daysUntilSpoiled <= 1}
          />
        )}
        {scan.color && (
          <StatCard label="Color" value={scan.color} emoji="🎨" />
        )}
      </div>

      {/* Recommendation */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Recommendation
        </p>
        <p className="text-sm leading-relaxed text-gray-700">{scan.recommendation}</p>
      </div>

      {/* Recipe card — overripe only */}
      {scan.recipe && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
            <span>🍞</span> Recipe Suggestion
          </p>
          <p className="text-sm leading-relaxed text-amber-900">{scan.recipe}</p>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col gap-3 pt-1">
        {!tracked ? (
          <button
            onClick={handleTrack}
            disabled={isPending}
            className="flex items-center justify-center gap-2 rounded-2xl bg-amber-400 py-4 font-bold text-amber-900 shadow-md transition hover:bg-amber-300 active:scale-95 disabled:opacity-60"
          >
            <BookmarkPlus className="h-5 w-5" />
            {isPending ? "Creating tracker…" : "Track This Banana"}
          </button>
        ) : (
          <button
            onClick={() => scan.trackerId && router.push(`/track/${scan.trackerId}`)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-amber-400 py-4 font-bold text-amber-900 shadow-md transition hover:bg-amber-300 active:scale-95"
          >
            View Tracker <ChevronRight className="h-4 w-4" />
          </button>
        )}

        <button
          onClick={() => router.push("/scan")}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-amber-200 bg-white py-4 font-semibold text-amber-700 transition active:scale-95"
        >
          <ScanLine className="h-5 w-5" />
          Scan Another
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  emoji,
  urgent = false,
}: {
  label: string;
  value: string;
  emoji: string;
  urgent?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-3.5 shadow-sm">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className={cn("text-sm font-bold", urgent ? "text-red-500" : "text-gray-700")}>
        <span className="mr-1">{emoji}</span>
        {value}
      </p>
    </div>
  );
}
