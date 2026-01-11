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
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Speichern");
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

    onError: (err, _newData, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(["company"], ctx.prev);
      }
      toast.error(err.message);
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
