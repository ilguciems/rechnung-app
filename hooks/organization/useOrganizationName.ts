import { useQuery } from "@tanstack/react-query";
import { ROUTES } from "@/lib/api-routes";
import type { OrganizationNameType } from "@/lib/zod-schema";

export const useOrganizationName = () => {
  return useQuery<OrganizationNameType, Error>({
    queryKey: ["organization-name"],
    queryFn: async () => {
      const res = await fetch(ROUTES.ORGANIZATION_NAME);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Laden");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
};
