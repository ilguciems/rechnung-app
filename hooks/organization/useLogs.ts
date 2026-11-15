import { useInfiniteQuery } from "@tanstack/react-query";
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

export type ActivityLogPage = {
  data: ActivityLogType[];
  nextCursor: string | null;
};

export const useLogs = () => {
  return useInfiniteQuery({
    queryKey: ["organization-logs"],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set("cursor", pageParam);
      const query = params.toString();

      const res = await fetch(
        `${ROUTES.ORGANIZATION_LOGS}${query ? `?${query}` : ""}`,
      );
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Laden der Logs");
      }
      return (await res.json()) as ActivityLogPage;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};
