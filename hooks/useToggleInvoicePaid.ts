"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ROUTES } from "@/lib/api-routes";

export function useToggleInvoicePaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, current }: { id: string; current: boolean }) => {
      const res = await fetch(ROUTES.INVOICE(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid: !current }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Aktualisieren");
      }
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "invoices" ||
          query.queryKey[0] === "organization-logs" ||
          query.queryKey[0] === "organization-stats",
      });
      toast.success("Status aktualisiert!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
