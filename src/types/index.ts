export type RipenessStage = "UNRIPE" | "NEARLY_RIPE" | "RIPE" | "OVERRIPE";

export type AnalysisResult = {
  ripenessPercent: number;
  stage: RipenessStage;
  daysUntilSpoiled: number | null;
  color: string;
  recommendation: string;
  recipe: string | null;
};

export type ScanWithTracker = {
  id: string;
  createdAt: Date;
  imageUrl: string;
  thumbnailUrl: string | null;
  ripenessPercent: number;
  stage: RipenessStage;
  daysUntilSpoiled: number | null;
  color: string | null;
  recommendation: string;
  recipe: string | null;
  trackerId: string | null;
};

export type TrackerWithScans = {
  id: string;
  name: string;
  active: boolean;
  createdAt: Date;
  predictedSpoilDate: Date | null;
  scans: ScanWithTracker[];
};
