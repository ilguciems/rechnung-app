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
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Laden");
      }
      return res.json();
    },
  });
}
