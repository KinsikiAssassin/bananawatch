"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  type TooltipProps,
} from "recharts";
import { RIPENESS_CONFIG } from "@/lib/ai-prompts";
import type { RipenessStage } from "@/types";

type DataPoint = {
  date: string;
  ripeness: number | null;
  predicted: number | null;
  stage: RipenessStage | null | undefined;
};

type RipenessChartProps = {
  data: DataPoint[];
  predictedSpoilDate: string | null; // ISO string
};

const STAGE_DOT_COLOR: Record<string, string> = {
  UNRIPE: "#22c55e",
  NEARLY_RIPE: "#a3e635",
  RIPE: "#f59e0b",
  OVERRIPE: "#b45309",
};

function CustomDot(props: {
  cx?: number;
  cy?: number;
  payload?: DataPoint;
  [key: string]: unknown;
}) {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload?.stage) return null;
  const color = STAGE_DOT_COLOR[payload.stage] ?? "#f59e0b";
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={color}
      stroke="white"
      strokeWidth={2}
    />
  );
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const actual = payload.find((p) => p.dataKey === "ripeness");
  const predicted = payload.find((p) => p.dataKey === "predicted");
  const stage = (actual?.payload as DataPoint)?.stage;
  const config = stage ? RIPENESS_CONFIG[stage] : null;

  return (
    <div className="rounded-xl border border-amber-100 bg-white px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-gray-700">{label}</p>
      {actual?.value != null && (
        <p className="text-amber-700">
          {config && `${config.emoji} `}
          {actual.value}% ripeness
        </p>
      )}
      {predicted?.value != null && !actual?.value && (
        <p className="text-gray-400 italic">Predicted: {predicted.value}%</p>
      )}
    </div>
  );
}

export function RipenessChart({ data, predictedSpoilDate }: RipenessChartProps) {
  const hasPrediction = data.some((d) => d.predicted !== null);

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="ripenessGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" vertical={false} />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            ticks={[0, 25, 50, 75, 100]}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Spoilage reference line */}
          {predictedSpoilDate && hasPrediction && (
            <ReferenceLine
              x={data[data.length - 1]?.date}
              stroke="#f87171"
              strokeDasharray="4 4"
              label={{ value: "Spoils", position: "insideTopRight", fontSize: 9, fill: "#f87171" }}
            />
          )}

          {/* Area fill under actual line */}
          <Area
            type="monotone"
            dataKey="ripeness"
            stroke="url(#ripenessGradient)"
            strokeWidth={2.5}
            fill="url(#areaFill)"
            dot={<CustomDot />}
            activeDot={{ r: 6, strokeWidth: 2, stroke: "white" }}
            connectNulls={false}
          />

          {/* Predicted dashed extension */}
          {hasPrediction && (
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#d1d5db"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={false}
              connectNulls={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
