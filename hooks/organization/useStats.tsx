import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { ROUTES } from "@/lib/api-routes";

const chartDataSchema = z.array(
  z.object({
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

export const useStats = () => {
  return useQuery<StatsType, Error>({
    queryKey: ["organization-stats"],
    queryFn: async () => {
      const res = await fetch(ROUTES.ORGANIZATION_STATS);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Laden");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
};
