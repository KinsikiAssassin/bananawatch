import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnalysisResult } from "@/components/scan/AnalysisResult";

export default async function ResultPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const scan = await prisma.scan.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: {
      id: true,
      imageUrl: true,
      ripenessPercent: true,
      stage: true,
      daysUntilSpoiled: true,
      color: true,
      recommendation: true,
      recipe: true,
      trackerId: true,
    },
  });

  if (!scan) notFound();

  return <AnalysisResult scan={scan} />;
}
