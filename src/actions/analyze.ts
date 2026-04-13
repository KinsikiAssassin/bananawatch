"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  BANANA_ANALYSIS_SYSTEM_PROMPT,
  BANANA_ANALYSIS_USER_PROMPT,
} from "@/lib/ai-prompts";

const AnalysisSchema = z.object({
  ripenessPercent: z.number().min(-1).max(100),
  stage: z.enum(["UNRIPE", "NEARLY_RIPE", "RIPE", "OVERRIPE"]),
  daysUntilSpoiled: z.number().nullable(),
  color: z.string(),
  recommendation: z.string(),
  recipe: z.string().nullable(),
});

const InputSchema = z.object({
  imageBase64: z.string().min(1),
  trackerId: z.string().optional(),
});

export async function analyzeImage(input: unknown) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" } as const;
  }

  const parsed = InputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" } as const;
  }

  const { imageBase64, trackerId } = parsed.data;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 600,
      messages: [
        {
          role: "system",
          content: BANANA_ANALYSIS_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            { type: "text", text: BANANA_ANALYSIS_USER_PROMPT },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: "low",
              },
            },
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: "Failed to parse AI response" } as const;
    }

    const analysisRaw = AnalysisSchema.safeParse(JSON.parse(jsonMatch[0]));
    if (!analysisRaw.success) {
      return { success: false, error: "Invalid AI response format" } as const;
    }

    const analysis = analysisRaw.data;

    if (analysis.ripenessPercent === -1) {
      return { success: false, error: analysis.recommendation } as const;
    }

    const scan = await prisma.scan.create({
      data: {
        imageUrl: `data:image/jpeg;base64,${imageBase64}`,
        ripenessPercent: analysis.ripenessPercent,
        stage: analysis.stage,
        daysUntilSpoiled: analysis.daysUntilSpoiled,
        color: analysis.color,
        recommendation: analysis.recommendation,
        recipe: analysis.recipe,
        userId: session.user.id,
        trackerId: trackerId ?? null,
      },
    });

    // Recalculate spoilage prediction whenever a new scan is added to a tracker
    if (trackerId) {
      await refreshTrackerPrediction(trackerId);
    }

    return { success: true, data: { scanId: scan.id, analysis } } as const;
  } catch (err) {
    console.error("[analyzeImage]", err);
    return { success: false, error: "Analysis failed. Please try again." } as const;
  }
}

// ─── helpers ──────────────────────────────────────────────────────────────────

async function refreshTrackerPrediction(trackerId: string) {
  const scans = await prisma.scan.findMany({
    where: { trackerId },
    select: { createdAt: true, ripenessPercent: true },
    orderBy: { createdAt: "asc" },
  });

  if (scans.length < 2) return;

  const last = scans[scans.length - 1];
  const prev = scans[scans.length - 2];
  const daysDiff =
    (new Date(last.createdAt).getTime() - new Date(prev.createdAt).getTime()) / 86_400_000;
  if (daysDiff <= 0) return;

  const ratePerDay = (last.ripenessPercent - prev.ripenessPercent) / daysDiff;
  if (ratePerDay <= 0) return;

  const daysToSpoil = (100 - last.ripenessPercent) / ratePerDay;
  const predictedSpoilDate = new Date(
    new Date(last.createdAt).getTime() + daysToSpoil * 86_400_000
  );

  await prisma.bananaTracker.update({
    where: { id: trackerId },
    data: { predictedSpoilDate },
  });

  revalidatePath(`/track/${trackerId}`);
}
