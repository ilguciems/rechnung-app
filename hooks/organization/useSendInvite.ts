"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ROUTES } from "@/lib/api-routes";
import type { SendInviteType } from "@/lib/zod-schema";

export function useSendInvite(onSuccessReset?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<SendInviteType, Error, SendInviteType>({
    mutationFn: async (invite: SendInviteType) => {
      const res = await fetch(ROUTES.INVITE_ORGANIZATION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invite),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Erstellen");
      }
      return res.json();
    },

    onError: (error) => {
      toast.error(error.message);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
      toast.success("Invitation gesendet!");

      if (onSuccessReset) onSuccessReset();
    },
  });
}
