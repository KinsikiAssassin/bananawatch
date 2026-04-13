import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ScanList } from "@/components/history/ScanList";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const scans = await prisma.scan.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      imageUrl: true,
      ripenessPercent: true,
      stage: true,
      daysUntilSpoiled: true,
      trackerId: true,
    },
  });

  return (
    <div className="flex flex-col gap-4 px-4 py-5">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold text-amber-900">Your Scans</h1>
        {scans.length > 0 && (
          <span className="text-sm text-gray-400">{scans.length} total</span>
        )}
      </div>
      <ScanList initialScans={scans} />
    </div>
  );
}
