import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TrackerCard } from "@/components/track/TrackerCard";
import type { RipenessStage } from "@/types";

export default async function TrackListPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const trackers = await prisma.bananaTracker.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      scans: {
        select: { id: true, createdAt: true, ripenessPercent: true, stage: true, imageUrl: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const active = trackers.filter((t) => t.active);
  const past = trackers.filter((t) => !t.active);

  if (trackers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 px-4 py-20 text-center">
        <span className="text-7xl">📊</span>
        <div>
          <p className="text-lg font-bold text-amber-800">No trackers yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Scan a banana and tap &ldquo;Track This Banana&rdquo; to start monitoring it over time.
          </p>
        </div>
        <Link
          href="/scan"
          className="rounded-2xl bg-amber-400 px-6 py-3 font-semibold text-amber-900 shadow-md transition hover:bg-amber-300 active:scale-95"
        >
          Scan a Banana
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-5">
      <h1 className="text-xl font-bold text-amber-900">Banana Trackers</h1>

      {active.length > 0 && (
        <section className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active</p>
          {active.map((tracker) => {
            const sorted = [...tracker.scans].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            const first = sorted[0];
            const last = sorted[sorted.length - 1];
            const daysTracked = first
              ? Math.max(1, Math.ceil((Date.now() - new Date(first.createdAt).getTime()) / 86_400_000))
              : 0;
            return (
              <TrackerCard
                key={tracker.id}
                id={tracker.id}
                name={tracker.name}
                active={tracker.active}
                currentRipeness={last?.ripenessPercent ?? 0}
                currentStage={(last?.stage ?? "UNRIPE") as RipenessStage}
                daysTracked={daysTracked}
                lastScanned={last?.createdAt.toISOString() ?? new Date().toISOString()}
                predictedSpoilDate={tracker.predictedSpoilDate?.toISOString() ?? null}
                scanCount={tracker.scans.length}
                imageUrl={last?.imageUrl ?? first?.imageUrl ?? ""}
              />
            );
          })}
        </section>
      )}

      {past.length > 0 && (
        <section className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Past</p>
          {past.map((tracker) => {
            const sorted = [...tracker.scans].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            const first = sorted[0];
            const last = sorted[sorted.length - 1];
            const daysTracked = first
              ? Math.max(1, Math.ceil((Date.now() - new Date(first.createdAt).getTime()) / 86_400_000))
              : 0;
            return (
              <TrackerCard
                key={tracker.id}
                id={tracker.id}
                name={tracker.name}
                active={tracker.active}
                currentRipeness={last?.ripenessPercent ?? 0}
                currentStage={(last?.stage ?? "UNRIPE") as RipenessStage}
                daysTracked={daysTracked}
                lastScanned={last?.createdAt.toISOString() ?? new Date().toISOString()}
                predictedSpoilDate={tracker.predictedSpoilDate?.toISOString() ?? null}
                scanCount={tracker.scans.length}
                imageUrl={last?.imageUrl ?? first?.imageUrl ?? ""}
              />
            );
          })}
        </section>
      )}
    </div>
  );
}
