import { useQuery } from "@tanstack/react-query";
import { ROUTES } from "@/lib/api-routes";

type CompanyLogo = {
  logoUrl: string | null;
};

export function useCompanyLogo() {
  return useQuery<CompanyLogo, Error>({
    queryKey: ["company-logo"],
    queryFn: async () => {
      const res = await fetch(ROUTES.COMPANY_LOGO);

      if (!res.ok) {
        throw new Error("Fehler beim Laden des Logos");
      }
      return res.json();
    },
  });
}
