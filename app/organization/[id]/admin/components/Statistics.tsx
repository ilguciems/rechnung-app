"use client";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { useStats } from "@/hooks";
import { DashboardSkeleton } from "./DashboardSkeleton";

import { RevenueChart } from "./RevenueChart";

export default function Statistics() {
  const t = useTranslations("organization.statistics");
  const { data, isLoading } = useStats();

  if (isLoading) return <DashboardSkeleton />;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "EUR",
    }).format(value || 0);

  const statCards = [
    {
      label: t("totalRevenue"),
      value: data?.stats.totalRevenue,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: t("pendingAmount"),
      value: data?.stats.pendingAmount,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: t("overdueAmount"),
      value: data?.stats.overdueAmount,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: t("expectedNext14Days"),
      value: data?.stats.expectedNext14Days,
      color: "text-amber-600",
      bg: "bg-amber-50",
      description: t("expectedDescription"),
      helperText: t("expectedHelper"),
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statCards.map((card) => {
          const formattedValue = formatCurrency(card.value || 0);

          return (
            <section
              key={card.label}
              className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between min-h-35"
              aria-labelledby={`label-${card.label}`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <p
                    id={`label-${card.label}`}
                    className="text-sm font-medium text-gray-500 dark:text-gray-300 truncate"
                  >
                    {card.label}
                  </p>
                  {card.description && (
                    <div className="group relative">
                      <button
                        type="button"
                        aria-label={t("additionalInfo", { label: card.label })}
                        className="flex items-center outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
                      >
                        <Info className="w-4 h-4 text-gray-500 dark:text-gray-300 cursor-help transition-colors group-hover:text-gray-800 group-focus:text-gray-800" />
                      </button>
                      <div
                        role="tooltip"
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block group-focus-within:block w-48 p-2 bg-gray-900 text-white text-[12px] rounded shadow-xl z-10 leading-tight pointer-events-none"
                      >
                        {card.description}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
                  <output
                    className={`font-bold transition-all duration-300 ${card.color} text-2xl`}
                    aria-hidden="true"
                  >
                    {formattedValue}
                  </output>
                </div>
              </div>
              {card.helperText && (
                <div className="mt-2">
                  <span className="text-[12px] tracking-wider text-gray-500 dark:text-gray-300">
                    {card.helperText}
                  </span>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <h3 className="text-lg font-semibold mb-6">{t("title")}</h3>
        <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
          <div className="min-w-75 h-87.5">
            <RevenueChart data={data?.chartData || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
