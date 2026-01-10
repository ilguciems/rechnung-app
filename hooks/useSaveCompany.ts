import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ROUTES } from "@/lib/api-routes";
import type { Company } from "@/lib/zod-schema";

export function useSaveCompany(company?: Company) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form: Partial<Company>) => {
      const method = company ? "PATCH" : "POST";

      const res = await fetch(ROUTES.COMPANY, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Fehler beim Speichern der Firma");
      }

      return res.json();
    },

    // Optimistic update
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["company"] });

      const prev = queryClient.getQueryData<Company>(["company"]);

      queryClient.setQueryData(["company"], {
        ...prev,
        ...newData,
      });

      return { prev };
    },

    onError: (_err, _newData, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(["company"], ctx.prev);
      }
      toast.error("Fehler beim Speichern");
    },

    onSuccess: (newCompany) => {
      queryClient.setQueryData(["company"], newCompany);
      toast.success("Unternehmensdaten gespeichert!");
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "company" ||
          query.queryKey[0] === "organization-logs",
      });
    },
  });
}
