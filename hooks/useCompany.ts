import { useQuery } from "@tanstack/react-query";
import { ROUTES } from "@/lib/api-routes";
import type { Company } from "@/lib/zod-schema";

export function useCompany() {
  return useQuery<Company, Error>({
    queryKey: ["company"],
    queryFn: async () => {
      const res = await fetch(ROUTES.COMPANY);

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Laden");
      }

      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
}
