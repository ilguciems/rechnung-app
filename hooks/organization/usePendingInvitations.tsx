"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { ROUTES } from "@/lib/api-routes";

const pendingInvitationsSchema = z.array(
  z.object({
    id: z.string(),
    email: z.string(),
    role: z.string(),
    expiresAt: z.string(),
  }),
);

type Invitation = z.infer<typeof pendingInvitationsSchema>;

export function usePendingInvitations() {
  const queryClient = useQueryClient();
  const query = useQuery<Invitation, Error>({
    queryKey: ["pending-invitations"],
    queryFn: async () => {
      const res = await fetch(ROUTES.ORGANIZATION_PENDING_INVITATIONS);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Laden der Logs");
      }
      return res.json();
    },
  });

  const revokeInvitation = useMutation<void, Error, { invitationId: string }>({
    mutationFn: async ({ invitationId }) => {
      const res = await fetch(ROUTES.ORGANIZATION_PENDING_INVITATIONS, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Widerrufen");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pending-invitations"],
      });
    },
  });

  return { ...query, revokeInvitation };
}
