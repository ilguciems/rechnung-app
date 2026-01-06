import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ROUTES } from "@/lib/api-routes";
import type { OrganizationNameType } from "@/lib/zod-schema";

export const useUpdateOrganizationName = () => {
  const queryClient = useQueryClient();

  return useMutation<OrganizationNameType, Error, OrganizationNameType>({
    mutationFn: async (newOrganizationName: OrganizationNameType) => {
      const res = await fetch(ROUTES.ORGANIZATION_NAME, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrganizationName),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Aktualisieren");
      }
      return res.json();
    },

    onError: (error) => {
      toast.error(error.message);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-name"] });
      toast.success("Name aktualisiert!");
    },
  });
};
