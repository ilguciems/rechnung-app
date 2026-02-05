import { useQuery } from "@tanstack/react-query";
import { ROUTES } from "@/lib/api-routes";

export type ActivityLogType = {
  id: string;
  createdAt: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "DOWNLOAD" | "SEND";
  entityType: "INVOICE" | "COMPANY" | "EMAIL";
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
    queryKey: ["organization-logs"],
    queryFn: async () => {
      const res = await fetch(ROUTES.ORGANIZATION_LOGS);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Laden der Logs");
      }
      return res.json();
    },
  });
};
