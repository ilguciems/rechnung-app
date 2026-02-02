import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { ROUTES } from "@/lib/api-routes";
import type { OrganizationConfigMailType } from "@/lib/zod-schema";

type MailConfigDataType = {
  isPublicKeySet: boolean;
  isPrivateKeySet: boolean;
  fromEmail: string;
  fromName: string;
  isEnabled: boolean;
};

export const useMailConfig = (mailConfig: boolean) => {
  const queryClient = useQueryClient();

  const updateOrCreateMailConfig = useMutation({
    mutationFn: async (form: Partial<OrganizationConfigMailType>) => {
      const method = mailConfig ? "PATCH" : "POST";

      const res = await fetch(ROUTES.ORGANIZATION_CONFIG_MAIL, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Speichern");
      }

      return res.json();
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["mail-config-data"] });

      const prev = queryClient.getQueryData<OrganizationConfigMailType>([
        "mail-config-data",
      ]);

      queryClient.setQueryData(["mail-config-data"], {
        ...prev,
        ...newData,
      });

      return { prev };
    },
    onError: (error) => toast.error(error.message),
    onSuccess: async (newData) => {
      queryClient.setQueryData(["mail-config-data"], newData);
      toast.success("Einstellungen erfolgreich gespeichert");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "mail-config-data" ||
          query.queryKey[0] === "mail-status",
      });
    },
  });

  const deleteMailConfig = useMutation({
    mutationFn: async () =>
      await fetch(ROUTES.ORGANIZATION_CONFIG_MAIL, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "mail-config-data" ||
          query.queryKey[0] === "mail-status",
      });
      toast.success("Einstellungen erfolgreich geloescht");
    },
  });

  return { updateOrCreateMailConfig, deleteMailConfig };
};

export const useMailConfigData = () => {
  const { data, isLoading } = useQuery<MailConfigDataType, Error>({
    queryKey: ["mail-config-data"],
    queryFn: async () => {
      const res = await fetch(ROUTES.ORGANIZATION_CONFIG_MAIL);

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Laden");
      }

      return res.json();
    },
  });

  return { data, isLoading };
};
