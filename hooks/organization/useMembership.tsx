"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { ROUTES } from "@/lib/api-routes";
import type { OrganizationMembershipType } from "@/lib/zod-schema";

export function useMembership() {
  const queryClient = useQueryClient();
  const query = useQuery<OrganizationMembershipType[], Error>({
    queryKey: ["membership-list"],
    queryFn: async () => {
      const res = await fetch(ROUTES.ORGANIZATION_MEMBERSHIP);

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Laden");
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const changeRole = useMutation<
    void,
    Error,
    { userId: string; role: "admin" | "member" }
  >({
    mutationFn: async ({ userId, role }) => {
      const res = await fetch(ROUTES.ORGANIZATION_MEMBERSHIP, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Aktualisieren");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membership-list"] });
      toast.success("Rolle geändert!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMembership = useMutation<void, Error, { userId: string }>({
    mutationFn: async ({ userId }) => {
      const res = await fetch(ROUTES.ORGANIZATION_MEMBERSHIP, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Löschen");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membership-list"] });
      toast.success("Mitglied gelöscht!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  return { ...query, changeRole, deleteMembership };
}
