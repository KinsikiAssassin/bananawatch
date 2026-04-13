"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getScans() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" } as const;

  try {
    const scans = await prisma.scan.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        thumbnailUrl: true,
        ripenessPercent: true,
        stage: true,
        recommendation: true,
        trackerId: true,
      },
    });
    return { success: true, data: scans } as const;
  } catch {
    return { success: false, error: "Failed to fetch scans" } as const;
  }
}

export async function getScan(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" } as const;

  try {
    const scan = await prisma.scan.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!scan) return { success: false, error: "Not found" } as const;
    return { success: true, data: scan } as const;
  } catch {
    return { success: false, error: "Failed to fetch scan" } as const;
  }
}

export async function deleteScan(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" } as const;

  try {
    await prisma.scan.deleteMany({
      where: { id, userId: session.user.id },
    });
    revalidatePath("/history");
    return { success: true } as const;
  } catch {
    return { success: false, error: "Failed to delete scan" } as const;
  }
}

export async function getAllTrackers() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" } as const;

  try {
    const trackers = await prisma.bananaTracker.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        scans: {
          select: {
            id: true,
            createdAt: true,
            ripenessPercent: true,
            stage: true,
            imageUrl: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    return { success: true, data: trackers } as const;
  } catch {
    return { success: false, error: "Failed to fetch trackers" } as const;
  }
}

export async function getTrackerWithScans(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" } as const;

  try {
    const tracker = await prisma.bananaTracker.findFirst({
      where: { id, userId: session.user.id },
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
    if (!tracker) return { success: false, error: "Not found" } as const;
    return { success: true, data: tracker } as const;
  } catch {
    return { success: false, error: "Failed to fetch tracker" } as const;
  }
}

export async function renameTracker(id: string, name: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" } as const;

  const parsed = z.string().min(1).max(50).safeParse(name);
  if (!parsed.success) return { success: false, error: "Name must be 1–50 characters" } as const;

  try {
    await prisma.bananaTracker.updateMany({
      where: { id, userId: session.user.id },
      data: { name: parsed.data },
    });
    revalidatePath(`/track/${id}`);
    revalidatePath("/track");
    return { success: true } as const;
  } catch {
    return { success: false, error: "Failed to rename tracker" } as const;
  }
}

export async function closeTracker(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" } as const;

  try {
    await prisma.bananaTracker.updateMany({
      where: { id, userId: session.user.id },
      data: { active: false },
    });
    revalidatePath("/track");
    return { success: true } as const;
  } catch {
    return { success: false, error: "Failed to close tracker" } as const;
  }
}

const CreateTrackerSchema = z.object({
  scanId: z.string(),
  name: z.string().min(1).max(50).optional(),
});

export async function createTracker(input: unknown) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" } as const;

  const parsed = CreateTrackerSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" } as const;

  const { scanId, name } = parsed.data;

  try {
    const tracker = await prisma.bananaTracker.create({
      data: {
        name: name ?? "My Banana",
        userId: session.user.id,
      },
    });

    await prisma.scan.update({
      where: { id: scanId, userId: session.user.id },
      data: { trackerId: tracker.id },
    });

    revalidatePath(`/result/${scanId}`);
    return { success: true, data: { trackerId: tracker.id } } as const;
  } catch {
    return { success: false, error: "Failed to create tracker" } as const;
  }
}
