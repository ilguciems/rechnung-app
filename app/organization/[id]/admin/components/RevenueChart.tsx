"use client";

import { useTheme } from "@teispace/next-themes";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/app/components/Button";
import type { ChartDataType } from "@/hooks";
import { describeChartWindow, getChartWindow } from "@/lib/chart-window";

type Recharts = typeof import("recharts");

type ChartLibrary =
  | { status: "loading" }
  | { status: "ready"; recharts: Recharts }
  | { status: "failed" };

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "EUR",
});

const formattedValue = (value: number) => currencyFormatter.format(value || 0);

// Keeps the y axis gutter narrow without clipping five-digit amounts.
const formatAxisValue = (value: number) =>
  value >= 10_000 ? `€${Math.round(value / 1000)}k` : `€${value}`;

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
    <div className="w-full h-full min-w-0 overflow-hidden">
      <BarChart
        data={data}
        width="100%"
        height="100%"
        responsive
        margin={{ top: 5, right: 16, left: 0, bottom: 5 }}
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
          interval={0}
          tickFormatter={(value: string) => value.slice(0, 3)}
          tick={{ fill: "#9ca3af", fontSize: 11 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          width={48}
          tickMargin={6}
          tick={{ fill: "#9ca3af", fontSize: 11 }}
          tickFormatter={formatAxisValue}
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
          maxBarSize={30}
          animationDuration={500}
        />
        <Bar
          name={t("open")}
          dataKey="pending"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          maxBarSize={30}
          animationDuration={500}
        />
      </BarChart>
    </div>
  );
}

function ChartPageButton({
  label,
  direction,
  disabled,
  onClick,
}: {
  label: string;
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:disabled:hover:bg-gray-800"
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}

type RevenueChartProps = {
  title: string;
  data: ChartDataType;
  page: number;
  onPageChange: (page: number) => void;
};

export function RevenueChart({
  title,
  data,
  page,
  onPageChange,
}: RevenueChartProps) {
  const t = useTranslations("organization.statistics");
  const [attempt, setAttempt] = useState(0);
  const { visible, canPrev, canNext } = getChartWindow(data, page);
  const windowLabel = describeChartWindow(visible);
  const pageable = canPrev || canNext;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div
          className={`ml-auto flex items-center gap-2 ${
            pageable ? "w-full justify-between sm:w-auto sm:justify-end" : ""
          }`}
        >
          {pageable && (
            <ChartPageButton
              label={t("previousMonths")}
              direction="prev"
              disabled={!canPrev}
              onClick={() => onPageChange(page - 1)}
            />
          )}
          <p
            aria-live="polite"
            className="min-w-36 text-center text-xs text-gray-500 tabular-nums dark:text-gray-300"
          >
            {windowLabel}
          </p>
          {pageable && (
            <ChartPageButton
              label={t("nextMonths")}
              direction="next"
              disabled={!canNext}
              onClick={() => onPageChange(page + 1)}
            />
          )}
        </div>
      </div>
      <div className="relative h-80 min-h-0">
        {/* A failed import cannot be retried in place, so remounting the loader
            restarts the effect that fetches recharts. */}
        <ChartLoader
          key={attempt}
          data={visible}
          onRetry={() => setAttempt((current) => current + 1)}
        />
      </div>
    </div>
  );
}
