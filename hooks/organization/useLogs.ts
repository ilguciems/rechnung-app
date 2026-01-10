import { useQuery } from "@tanstack/react-query";
import { ROUTES } from "@/lib/api-routes";

export type ActivityLogType = {
  id: string;
  createdAt: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "DOWNLOAD";
  entityType: "INVOICE" | "COMPANY";
  entityId: number;

  user: {
    id: string;
    name: string | null;
    email: string;
  };

  metadata: {
    type: "invoice" | "company" | "payment-reminder";
    invoiceNumber?: string;
    format?: "pdf";
    level?: number;
    changes?: Record<
      string,
      {
        old: string | number | boolean | null;
        new: string | number | boolean | null;
      }
    >;
  };
};

export const useLogs = () => {
  return useQuery<ActivityLogType[]>({
    queryKey: ["organisation-logs"],
    queryFn: async () => {
      const res = await fetch(ROUTES.ORGANISATION_LOGS);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Laden der Logs");
      }
      return res.json();
    },
  });
};
