"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RIPENESS_CONFIG } from "@/lib/ai-prompts";
import type { RipenessStage } from "@/types";

type Scan = {
  id: string;
  createdAt: Date;
  imageUrl: string;
  ripenessPercent: number;
  stage: RipenessStage;
  daysUntilSpoiled: number | null;
  trackerId: string | null;
};

const DELETE_BTN_WIDTH = 80; // px revealed on swipe

function formatDate(date: Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: diffDays > 365 ? "numeric" : undefined });
}

export function ScanCard({
  scan,
  onDelete,
}: {
  scan: Scan;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const config = RIPENESS_CONFIG[scan.stage];

  // ── touch handlers ──────────────────────────────────────────────────────────

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    isDraggingRef.current = false;
    setIsSnapping(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientX - startXRef.current;
    if (Math.abs(delta) > 5) isDraggingRef.current = true;

    if (isSwiped) {
      // dragging while open: allow closing right swipe only
      const newOffset = Math.min(0, -DELETE_BTN_WIDTH + delta);
      setOffsetX(newOffset);
    } else {
      // dragging while closed: allow left swipe only
      if (delta > 0) return;
      setOffsetX(Math.max(-DELETE_BTN_WIDTH, delta));
    }
  };

  const handleTouchEnd = () => {
    setIsSnapping(true);
    if (isSwiped) {
      if (offsetX > -DELETE_BTN_WIDTH / 2) {
        setOffsetX(0);
        setIsSwiped(false);
      } else {
        setOffsetX(-DELETE_BTN_WIDTH);
        setIsSwiped(true);
      }
    } else {
      if (offsetX < -DELETE_BTN_WIDTH / 2) {
        setOffsetX(-DELETE_BTN_WIDTH);
        setIsSwiped(true);
      } else {
        setOffsetX(0);
      }
    }
  };

  const handleCardClick = () => {
    if (isDraggingRef.current) return;
    if (isSwiped) {
      setIsSnapping(true);
      setOffsetX(0);
      setIsSwiped(false);
      return;
    }
    router.push(`/result/${scan.id}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    onDelete(scan.id);
  };

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div className={cn("relative overflow-hidden rounded-2xl", isDeleting && "opacity-50 pointer-events-none")}>
      {/* Delete button (revealed behind the card on swipe) */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-red-500"
        style={{ width: DELETE_BTN_WIDTH }}
      >
        <button
          onClick={handleDelete}
          className="flex flex-col items-center gap-1 text-white"
          aria-label="Delete scan"
        >
          <Trash2 className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Delete</span>
        </button>
      </div>

      {/* Card (slides left to reveal delete) */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isSnapping ? "transform 0.2s ease" : "none",
        }}
        className="relative flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm cursor-pointer select-none"
      >
        {/* Thumbnail */}
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-amber-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={scan.imageUrl}
            alt="Banana scan"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Details */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            {/* Stage badge */}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-bold",
                config.badgeColor
              )}
            >
              {config.emoji} {config.label}
            </span>
            {/* Ripeness % */}
            <span
              className="text-lg font-bold tabular-nums"
              style={{ color: config.ringColor }}
            >
              {scan.ripenessPercent}%
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{formatDate(scan.createdAt)}</span>
            <span className="flex items-center gap-1">
              {scan.daysUntilSpoiled !== null && (
                <>
                  <span
                    className={cn(
                      scan.daysUntilSpoiled <= 1 ? "text-red-400 font-semibold" : ""
                    )}
                  >
                    {scan.daysUntilSpoiled === 0
                      ? "Spoiling today"
                      : `${scan.daysUntilSpoiled}d left`}
                  </span>
                </>
              )}
              {scan.trackerId && (
                <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-amber-700">
                  📍 tracked
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Swipe hint chevron */}
        <div className="shrink-0 text-gray-200">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
