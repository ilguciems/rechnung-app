import {
  addMonths,
  addYears,
  differenceInMonths,
  startOfMonth,
  startOfYear,
  subMonths,
  subYears,
} from "date-fns";

export const STATS_RANGES = [
  "3m",
  "6m",
  "12m",
  "ytd",
  "lastYear",
  "yearBeforeLast",
] as const;

export type StatsRange = (typeof STATS_RANGES)[number];

export const DEFAULT_STATS_RANGE: StatsRange = "6m";

export const isStatsRange = (value: string | null): value is StatsRange =>
  value !== null && STATS_RANGES.includes(value as StatsRange);

export type StatsWindow = {
  start: Date;
  end: Date;
  monthCount: number;
};

const ROLLING_MONTHS: Record<"3m" | "6m" | "12m", number> = {
  "3m": 3,
  "6m": 6,
  "12m": 12,
};

/**
 * First month of the range, the exclusive upper bound and how many month
 * buckets it spans, inclusive. Calendar years need the upper bound as well,
 * otherwise a past year would also collect the invoices of the years after it.
 */
export function resolveStatsRange(
  range: StatsRange,
  now: Date = new Date(),
): StatsWindow {
  if (range === "lastYear" || range === "yearBeforeLast") {
    const yearsBack = range === "lastYear" ? 1 : 2;

    return {
      start: startOfYear(subYears(now, yearsBack)),
      end: startOfYear(subYears(now, yearsBack - 1)),
      monthCount: 12,
    };
  }

  if (range === "ytd") {
    const start = startOfYear(now);

    return {
      start,
      end: startOfYear(addYears(now, 1)),
      monthCount: differenceInMonths(now, start) + 1,
    };
  }

  const monthCount = ROLLING_MONTHS[range];

  return {
    start: startOfMonth(subMonths(now, monthCount - 1)),
    end: startOfMonth(addMonths(now, 1)),
    monthCount,
  };
}
