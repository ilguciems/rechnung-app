"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ROUTES } from "@/lib/api-routes";
import type { Invoice } from "@/lib/zod-schema";

export function useCreateInvoice(onSuccessReset?: () => void) {
  const queryClient = useQueryClient();

  return useMutation<Invoice, Error, Invoice>({
    mutationFn: async (newInvoice: Invoice) => {
      const res = await fetch(ROUTES.INVOICES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInvoice),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Erstellen");
      }
      return res.json();
    },

    onError: (error) => {
      toast.error(error.message);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "invoices" ||
          query.queryKey[0] === "organization-logs" ||
          query.queryKey[0] === "organization-stats",
      });
      toast.success("Rechnung erstellt!");

      if (onSuccessReset) onSuccessReset();
    },
  });
}
