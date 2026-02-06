"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { ROUTES } from "@/lib/api-routes";

export const emailSchema = z.object({
  to: z.email("Ungültige E-Mail-Adresse"),
  subject: z.string().min(1, "Betreff erforderlich"),
  message: z.string().min(1, "Nachricht erforderlich"),
});

export type EmailFormValues = z.infer<typeof emailSchema>;

export function useSendEmail(
  invoiceId: string,
  type: "invoice" | "reminder",
  level?: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EmailFormValues) => {
      const endpoint =
        type === "invoice"
          ? ROUTES.INVOICE_SEND_EMAIL(invoiceId)
          : ROUTES.INVOICE_SEND_REMINDER_EMAIL(invoiceId, level);

      const res = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Senden");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("E-Mail wurde versendet");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
