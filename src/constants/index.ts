import type { RipenessStage } from "@/types";

export const RIPENESS_STAGES: Record<
  RipenessStage,
  { label: string; color: string; bgColor: string; range: [number, number] }
> = {
  UNRIPE: {
    label: "Unripe",
    color: "text-green-700",
    bgColor: "bg-green-100",
    range: [0, 25],
  },
  NEARLY_RIPE: {
    label: "Nearly Ripe",
    color: "text-lime-700",
    bgColor: "bg-lime-100",
    range: [25, 50],
  },
  RIPE: {
    label: "Ripe",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    range: [50, 75],
  },
  OVERRIPE: {
    label: "Overripe",
    color: "text-orange-900",
    bgColor: "bg-orange-100",
    range: [75, 100],
  },
};

export const STAGE_TIPS: Record<RipenessStage, string[]> = {
  UNRIPE: [
    "Leave at room temperature to ripen",
    "Do not refrigerate — cold stops ripening",
    "Place in a paper bag to speed up ripening",
  ],
  NEARLY_RIPE: [
    "1–2 days until perfect for eating",
    "Great for baking now — less sweet but holds shape",
    "Keep at room temperature",
  ],
  RIPE: [
    "Perfect for eating fresh",
    "Refrigerate to slow further ripening",
    "Ideal for smoothies and cereal",
  ],
  OVERRIPE: [
    "Best used for baking — sweetest flavor",
    "Freeze if not using within a day",
    "Perfect for banana bread, muffins, or pancakes",
  ],
};
