import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Camera } from "lucide-react";
import { EditableName } from "@/components/track/EditableName";
import { RipenessChart } from "@/components/track/RipenessChart";
import { Timeline } from "@/components/track/Timeline";
import { RIPENESS_CONFIG } from "@/lib/ai-prompts";
import type { RipenessStage } from "@/types";

export default async function TrackerDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const tracker = await prisma.bananaTracker.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      scans: {
        select: {
          id: true,
          createdAt: true,
          ripenessPercent: true,
          stage: true,
          imageUrl: true,
          daysUntilSpoiled: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!tracker) notFound();

  const scans = tracker.scans;
  const lastScan = scans[scans.length - 1];
  const lastConfig = lastScan ? RIPENESS_CONFIG[lastScan.stage as RipenessStage] : null;

  // ─── Build chart data ─────────────────────────────────────────────────────

  // Format a Date for chart X axis label
  const shortDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  type ChartPoint = { date: string; ripeness: number | null; predicted: number | null; stage: RipenessStage | null };
  const actualPoints: ChartPoint[] = scans.map((s) => ({
    date: shortDate(new Date(s.createdAt)),
    ripeness: s.ripenessPercent,
    predicted: null,
    stage: s.stage as RipenessStage,
  }));

  // Connect the last actual point to the predicted endpoint
  if (tracker.predictedSpoilDate && scans.length >= 2 && lastScan) {
    // Patch last actual point to also carry a `predicted` value (so line connects)
    actualPoints[actualPoints.length - 1].predicted = lastScan.ripenessPercent;
    actualPoints.push({
      date: shortDate(new Date(tracker.predictedSpoilDate)),
      ripeness: null,
      predicted: 100,
      stage: null,
    });
  }

  // ─── Build timeline data (newest first, with deltas) ─────────────────────

  const timelineScans = [...scans]
    .reverse()
    .map((scan, i, arr) => ({
      id: scan.id,
      createdAt: new Date(scan.createdAt).toISOString(),
      ripenessPercent: scan.ripenessPercent,
      stage: scan.stage as RipenessStage,
      imageUrl: scan.imageUrl,
      // delta vs previous (arr is reversed, so arr[i+1] is the prior scan)
      delta:
        i < arr.length - 1
          ? scan.ripenessPercent - arr[i + 1].ripenessPercent
          : null,
    }));

  // ─── Spoilage info ────────────────────────────────────────────────────────

  const spoilDays = tracker.predictedSpoilDate
    ? Math.round((new Date(tracker.predictedSpoilDate).getTime() - Date.now()) / 86_400_000)
    : null;

  return (
    <div className="flex flex-col gap-5 px-4 py-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <EditableName trackerId={tracker.id} initialName={tracker.name} />
        {lastConfig && (
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${lastConfig.badgeColor}`}>
            {lastConfig.emoji} {lastScan!.ripenessPercent}%
          </span>
        )}
      </div>

      {/* Stats row */}
      {scans.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-amber-800">{scans.length}</p>
            <p className="text-[10px] text-gray-400">Scans</p>
          </div>
          <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
            <p className="text-lg font-bold text-amber-800">
              {Math.max(1, Math.ceil((Date.now() - new Date(scans[0].createdAt).getTime()) / 86_400_000))}d
            </p>
            <p className="text-[10px] text-gray-400">Tracked</p>
          </div>
          <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
            {spoilDays !== null ? (
              <>
                <p className={`text-lg font-bold ${spoilDays <= 2 ? "text-red-400" : "text-amber-800"}`}>
                  {spoilDays <= 0 ? "Now" : `~${spoilDays}d`}
                </p>
                <p className="text-[10px] text-gray-400">To spoil</p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-gray-300">—</p>
                <p className="text-[10px] text-gray-400">To spoil</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="rounded-3xl bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Ripeness Over Time
        </p>
        {scans.length >= 2 ? (
          <>
            <RipenessChart
              data={actualPoints}
              predictedSpoilDate={tracker.predictedSpoilDate?.toISOString() ?? null}
            />
            {tracker.predictedSpoilDate && (
              <p className="mt-2 text-center text-xs text-gray-400">
                Predicted spoilage:{" "}
                <span className="font-semibold text-amber-700">
                  {new Date(tracker.predictedSpoilDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </p>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <span className="text-4xl">📈</span>
            <p className="text-sm text-gray-400">
              Add {scans.length === 0 ? "your first" : "one more"} scan to see the chart
            </p>
          </div>
        )}
      </div>

      {/* Add scan CTA */}
      <Link
        href={`/scan?trackerId=${tracker.id}`}
        className="flex items-center justify-center gap-2 rounded-2xl bg-amber-400 py-4 font-bold text-amber-900 shadow-md transition hover:bg-amber-300 active:scale-95"
      >
        <Camera className="h-5 w-5" />
        Add Today&apos;s Scan
      </Link>

      {/* Timeline */}
      {scans.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Timeline</p>
          <Timeline scans={timelineScans} />
        </div>
      )}
    </div>
  );
}
