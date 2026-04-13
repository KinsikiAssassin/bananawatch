"use client";

import { useState } from "react";
import Link from "next/link";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { deleteScan } from "@/actions/scan";
import { ScanCard } from "@/components/history/ScanCard";
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

export function ScanList({ initialScans }: { initialScans: Scan[] }) {
  const [scans, setScans] = useState(initialScans);

  const handleDelete = async (id: string) => {
    const removed = scans.find((s) => s.id === id)!;
    // Optimistic remove
    setScans((prev) => prev.filter((s) => s.id !== id));
    const result = await deleteScan(id);
    if (!result.success) {
      // Roll back
      setScans((prev) =>
        [...prev, removed].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
      toast.error("Failed to delete scan");
    } else {
      toast.success("Scan deleted");
    }
  };

  if (scans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-20 text-center">
        <span className="text-7xl">🍌</span>
        <div>
          <p className="text-lg font-bold text-amber-800">No scans yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Go scan your first banana to get started!
          </p>
        </div>
        <Link
          href="/scan"
          className="flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-semibold text-amber-900 shadow-md transition hover:bg-amber-300 active:scale-95"
        >
          <Camera className="h-5 w-5" />
          Scan a Banana
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-gray-400">Swipe left to delete</p>
      {scans.map((scan) => (
        <ScanCard key={scan.id} scan={scan} onDelete={handleDelete} />
      ))}
    </div>
  );
}
