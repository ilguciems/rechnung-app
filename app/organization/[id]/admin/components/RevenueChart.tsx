"use client";

import { useTheme } from "@teispace/next-themes";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/app/components/Button";
import type { ChartDataType } from "@/hooks";

type Recharts = typeof import("recharts");

type ChartLibrary =
  | { status: "loading" }
  | { status: "ready"; recharts: Recharts }
  | { status: "failed" };

const formattedValue = (value: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
  }).format(value || 0);

function ChartLoader({
  data,
  onRetry,
}: {
  data: ChartDataType;
  onRetry: () => void;
}) {
  const t = useTranslations("organization.statistics");
  const { theme } = useTheme();
  const [library, setLibrary] = useState<ChartLibrary>({ status: "loading" });

  // recharts is the heaviest dependency of this page and the chart sits below
  // the fold, so it is fetched after mount instead of shipped with the route.
  useEffect(() => {
    let cancelled = false;

    import("recharts")
      .then((module) => {
        if (!cancelled) setLibrary({ status: "ready", recharts: module });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error("Failed to load recharts", error);
        setLibrary({ status: "failed" });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (library.status === "loading") return null;

  if (library.status === "failed") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
        <p role="alert" className="text-sm text-gray-500 dark:text-gray-300">
          {t("chartLoadError")}
        </p>
        <Button size="small" onClick={onRetry}>
          {t("chartRetry")}
        </Button>
      </div>
    );
  }

  const dark = theme === "dark";

  const { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } =
    library.recharts;

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

export function RevenueChart({ data }: { data: ChartDataType }) {
  const [attempt, setAttempt] = useState(0);

  // A failed import cannot be retried in place, so remounting the loader
  // restarts the effect that fetches recharts.
  return (
    <ChartLoader
      key={attempt}
      data={data}
      onRetry={() => setAttempt((current) => current + 1)}
    />
  );
}
