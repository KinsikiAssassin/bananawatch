"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Camera, CheckCircle } from "lucide-react";
import { closeTracker } from "@/actions/scan";
import { RIPENESS_CONFIG } from "@/lib/ai-prompts";
import { cn } from "@/lib/utils";
import type { RipenessStage } from "@/types";

type TrackerCardProps = {
  id: string;
  name: string;
  active: boolean;
  currentRipeness: number;
  currentStage: RipenessStage;
  daysTracked: number;
  lastScanned: string; // ISO string
  predictedSpoilDate: string | null; // ISO string
  scanCount: number;
  imageUrl: string;
};

function shortDate(iso: string) {
  const d = new Date(iso);
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TrackerCard(props: TrackerCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [closed, setClosed] = useState(false);
  const config = RIPENESS_CONFIG[props.currentStage];

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      const result = await closeTracker(props.id);
      if (result.success) {
        setClosed(true);
        toast.success("Tracker marked as done");
      } else {
        toast.error(result.error);
      }
    });
  };

  if (closed) return null;

  const spoilDays = props.predictedSpoilDate
    ? Math.round((new Date(props.predictedSpoilDate).getTime() - Date.now()) / 86_400_000)
    : null;

  return (
    <div
      onClick={() => router.push(`/track/${props.id}`)}
      className="cursor-pointer rounded-3xl bg-white p-4 shadow-sm transition active:scale-[0.98]"
    >
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-amber-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={props.imageUrl} alt={props.name} className="h-full w-full object-cover" loading="lazy" />
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold text-amber-900 leading-tight">{props.name}</p>
            <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-bold", config.badgeColor)}>
              {config.emoji} {props.currentRipeness}%
            </span>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
            <span>📅 {props.daysTracked}d tracked</span>
            <span>🔍 {props.scanCount} scans</span>
            <span>Last: {shortDate(props.lastScanned)}</span>
          </div>

          {spoilDays !== null && (
            <p className={cn("text-xs font-semibold", spoilDays <= 2 ? "text-red-400" : "text-amber-600")}>
              {spoilDays <= 0
                ? "⚠️ Spoiling now!"
                : `🗓 Spoils in ~${spoilDays} day${spoilDays === 1 ? "" : "s"}`}
            </p>
          )}
        </div>
      </div>

      {/* Action row */}
      {props.active && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/scan?trackerId=${props.id}`); }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-400 py-2 text-xs font-bold text-amber-900 transition active:scale-95"
          >
            <Camera className="h-3.5 w-3.5" /> Add Today&apos;s Scan
          </button>
          <button
            onClick={handleClose}
            disabled={isPending}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 transition active:scale-95 disabled:opacity-50"
            title="Mark as done"
          >
            <CheckCircle className="h-3.5 w-3.5" /> Done
          </button>
        </div>
      )}
    </div>
  );
}
