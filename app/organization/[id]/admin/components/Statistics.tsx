"use client";
import { useStats } from "@/hooks";
import { DashboardSkeleton } from "./DashboardSkeleton";

import { RevenueChart } from "./RevenueChart";

export default function Statistics() {
  const { data, isLoading } = useStats();

  if (isLoading) return <DashboardSkeleton />;

  const statCards = [
    {
      label: "Gesamtumsatz",
      value: data?.stats.totalRevenue,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Offene Beträge",
      value: data?.stats.pendingAmount,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Überfällig",
      value: data?.stats.overdueAmount,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${card.color}`}>
                {new Intl.NumberFormat("de-DE", {
                  style: "currency",
                  currency: "EUR",
                }).format(card.value || 0)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <h3 className="text-lg font-semibold mb-6">Umsatzübersicht</h3>
        <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
          <div className="min-w-[600px] h-[350px]">
            <RevenueChart data={data?.chartData || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
