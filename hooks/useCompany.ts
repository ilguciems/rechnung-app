import { useQuery } from "@tanstack/react-query";
import { ROUTES } from "@/lib/api-routes";
import type { Company } from "@/lib/zod-schema";

export function useCompany() {
  return useQuery<Company, Error>({
    queryKey: ["company"],
    queryFn: async () => {
      const res = await fetch(ROUTES.COMPANY);

      if (!res.ok) {
        throw new Error("Fehler beim Laden der Firma");
      }

      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
}
