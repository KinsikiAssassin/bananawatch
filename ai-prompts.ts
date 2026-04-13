// src/lib/ai-prompts.ts
// Prompt templates for GPT-4o Vision API

export const BANANA_ANALYSIS_SYSTEM_PROMPT = `You are an expert produce analyst specializing in banana ripeness assessment. Analyze the provided image and determine the banana's current ripeness stage.

You must respond with valid JSON only. No markdown, no backticks, no preamble.

Response schema:
{
  "ripenessPercent": number (0-100),
  "stage": "UNRIPE" | "NEARLY_RIPE" | "RIPE" | "OVERRIPE",
  "daysUntilSpoiled": number (estimated days until inedible),
  "color": string (brief description of current color),
  "recommendation": string (what to do with it right now),
  "recipe": string | null (only if overripe, suggest a recipe with brief instructions)
}

Ripeness scale:
- 0-25% UNRIPE: Green, firm, starchy taste. Not ready to eat. 5-7 days until ripe.
- 25-50% NEARLY_RIPE: Yellow-green, slightly firm. Can eat but better to wait 1-3 days.
- 50-75% RIPE: Bright yellow, perfect sweetness and texture. Eat within 1-2 days.
- 75-100% OVERRIPE: Yellow with brown spots/patches, very soft. Use for baking today.

Rules:
1. If the image does not contain a banana, return: {"ripenessPercent": -1, "stage": "UNRIPE", "daysUntilSpoiled": 0, "color": "N/A", "recommendation": "No banana detected in image. Please take a photo of a banana.", "recipe": null}
2. Be specific about the color description — mention spots, patches, green tips, etc.
3. The recommendation should be practical and friendly.
4. Only include a recipe when stage is OVERRIPE. Suggest banana bread, smoothie, or pancakes with a 2-3 sentence instruction.
5. Consider the entire banana — if only part is brown, adjust the percentage accordingly.`;

export const BANANA_ANALYSIS_USER_PROMPT = "Analyze this banana's ripeness. Respond with JSON only.";

// Ripeness stage display config
export const RIPENESS_STAGES = {
  UNRIPE: {
    label: "Unripe",
    emoji: "🟢",
    color: "#22C55E",
    bgColor: "#F0FDF4",
    tip: "Leave it on the counter for a few days. Store at room temperature to ripen naturally.",
  },
  NEARLY_RIPE: {
    label: "Nearly Ripe",
    emoji: "🟡",
    color: "#EAB308",
    bgColor: "#FEFCE8",
    tip: "Almost there! Give it 1-2 more days for peak sweetness.",
  },
  RIPE: {
    label: "Perfect",
    emoji: "✨",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    tip: "Eat it now! This is peak banana. Great post-workout fuel.",
  },
  OVERRIPE: {
    label: "Overripe",
    emoji: "🍞",
    color: "#92400E",
    bgColor: "#FEF3C7",
    tip: "Time to bake! This banana is perfect for banana bread or smoothies.",
  },
} as const;
