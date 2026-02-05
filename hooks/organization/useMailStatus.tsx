import { useQuery } from "@tanstack/react-query";
import { ROUTES } from "@/lib/api-routes";

type MailConfigStatusType = {
  canSendEmail: boolean;
};

export const useMailStatus = () => {
  const { data, isLoading } = useQuery<MailConfigStatusType, Error>({
    queryKey: ["mail-status"],
    queryFn: async () => {
      const res = await fetch(ROUTES.ORGANIZATION_MAIL_STATUS);

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Laden");
      }

      return res.json();
    },
  });

  return { data, isLoading };
};
