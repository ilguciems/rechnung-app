"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { ROUTES } from "@/lib/api-routes";

export function useDownloadReminderPdf() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const downloadReminder = async (id: number, level: number = 1) => {
    try {
      setLoading(true);

      const query = new URLSearchParams({
        fee: level === 1 ? "0" : "2.50",
        days: "7",
        level: level.toString(),
      });

      const res = await fetch(`${ROUTES.REMINDER_PDF(id)}?${query}`);

      if (!res.ok) {
        toast.error("Fehler beim Mahnung-Export");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${level}-mahnung-${id}.pdf`;
      link.click();

      URL.revokeObjectURL(url);
      queryClient.invalidateQueries({ queryKey: ["organization-logs"] });
      toast.success("Mahnung erfolgreich erstellt");
    } catch (err) {
      console.error(err);
      toast.error("Fehler beim Mahnung-Export");
    } finally {
      setLoading(false);
    }
  };

  return { downloadReminder, loading };
}
