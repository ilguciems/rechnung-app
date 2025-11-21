"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ROUTES } from "@/lib/api-routes";
import type { Invoice } from "@/lib/zod-schema";

export function useCreateInvoice(onSuccessReset?: () => void) {
  const queryClient = useQueryClient();

  return useMutation<Invoice, unknown, Invoice>({
    mutationFn: async (newInvoice: Invoice) => {
      const res = await fetch(ROUTES.INVOICES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInvoice),
      });
      if (!res.ok) throw new Error("Fehler beim Erstellen");
      return res.json();
    },

    onError: () => {
      toast.error("Fehler beim Erstellen");
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Rechnung erstellt!");

      if (onSuccessReset) onSuccessReset();
    },
  });
}
