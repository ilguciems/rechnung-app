import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ROUTES } from "@/lib/api-routes";
import type { OrganizationNameType } from "@/lib/zod-schema";

export const useUpdateOrganizationName = () => {
  const queryClient = useQueryClient();

  return useMutation<OrganizationNameType, unknown, OrganizationNameType>({
    mutationFn: async (newOrganizationName: OrganizationNameType) => {
      const res = await fetch(ROUTES.ORGANIZATION_NAME, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrganizationName),
      });
      if (!res.ok) throw new Error("Fehler beim Aktualisieren");
      return res.json();
    },

    onError: () => {
      toast.error("Fehler beim Aktualisieren");
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-name"] });
      toast.success("Name aktualisiert!");
    },
  });
};
