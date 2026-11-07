"use client";

import { useTheme } from "@teispace/next-themes";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import type { ChartDataType } from "@/hooks";

type Recharts = typeof import("recharts");

const formattedValue = (value: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
  }).format(value || 0);

export function RevenueChart({ data }: { data: ChartDataType }) {
  const t = useTranslations("organization.statistics");
  const { theme } = useTheme();
  const [recharts, setRecharts] = useState<Recharts | null>(null);

  // recharts is the heaviest dependency of this page and the chart sits below
  // the fold, so it is fetched after mount instead of shipped with the route.
  useEffect(() => {
    let cancelled = false;

    import("recharts").then((module) => {
      if (!cancelled) setRecharts(module);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const dark = theme === "dark";

  if (!recharts) return null;

  const { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } =
    recharts;

  return (
    <div className="w-full h-87.5 min-w-0 overflow-hidden">
      <BarChart
        data={data}
        width="100%"
        height="100%"
        responsive
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke={dark ? "#374151" : "#f0f0f0"}
        />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#9ca3af", fontSize: 12 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          tickFormatter={(value) => `€${value}`}
        />
        <Tooltip
          cursor={{ fill: dark ? "#374151" : "#f9fafb" }}
          formatter={(value) => formattedValue(value as number)}
          contentStyle={{
            backgroundColor: dark ? "#374151" : "#f9fafb",
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
          }}
        />
        <Legend iconType="circle" />
        <Bar
          name={t("paid")}
          dataKey="revenue"
          fill="#10b981"
          radius={[4, 4, 0, 0]}
          barSize={30}
        />
        <Bar
          name={t("open")}
          dataKey="pending"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          barSize={30}
        />
      </BarChart>
    </div>
  );
}
