"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ChartDataType } from "@/hooks";

export function RevenueChart({ data }: { data: ChartDataType }) {
  return (
    <div className="w-full h-[350px] min-w-0 overflow-hidden">
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
          stroke="#f0f0f0"
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
          cursor={{ fill: "#f9fafb" }}
          formatter={(value) => `€${value}`}
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
          }}
        />
        <Legend iconType="circle" />
        <Bar
          name="Bezahlt"
          dataKey="revenue"
          fill="#10b981"
          radius={[4, 4, 0, 0]}
          barSize={30}
        />
        <Bar
          name="Offen"
          dataKey="pending"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          barSize={30}
        />
      </BarChart>
    </div>
  );
}
