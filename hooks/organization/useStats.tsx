import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ROUTES } from "@/lib/api-routes";
import { DEFAULT_STATS_RANGE, type StatsRange } from "@/lib/stats-range";

const chartDataSchema = z.array(
  z.object({
    monthKey: z.string(),
    month: z.string(),
    pending: z.number(),
    revenue: z.number(),
  }),
);

const statsDataSchema = z.object({
  overdueAmount: z.number(),
  pendingAmount: z.number(),
  totalRevenue: z.number(),
  expectedNext14Days: z.number(),
});

const statsSchema = z.object({
  chartData: chartDataSchema,
  stats: statsDataSchema,
});

export type StatsType = z.infer<typeof statsSchema>;
export type ChartDataType = z.infer<typeof chartDataSchema>;

export const useStats = (range: StatsRange = DEFAULT_STATS_RANGE) => {
  return useQuery<StatsType, Error>({
    queryKey: ["organization-stats", range],
    queryFn: async () => {
      const res = await fetch(ROUTES.ORGANIZATION_STATS(range));
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Laden");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
};
