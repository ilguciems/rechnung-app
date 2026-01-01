"use client";
import { useTimer } from "@/context/TimerContext";

export function HeaderTimer() {
  const { timeLeft, WARNING_TIME } = useTimer();

  if (timeLeft === null || timeLeft <= WARNING_TIME) return null;

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 border rounded-full text-[12px] font-medium text-gray-500">
      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      <span>
        Sitzung: {hours > 0 ? `${hours}Std.` : ""}
        {minutes}Min.
      </span>
    </div>
  );
}
