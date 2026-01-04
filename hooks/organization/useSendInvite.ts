"use client";

import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ROUTES } from "@/lib/api-routes";
import type { SendInviteType } from "@/lib/zod-schema";

export function useSendInvite(onSuccessReset?: () => void) {
  return useMutation<SendInviteType, unknown, SendInviteType>({
    mutationFn: async (invite: SendInviteType) => {
      const res = await fetch(ROUTES.INVITE_ORGANIZATION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invite),
      });
      if (!res.ok) throw new Error("Fehler beim Erstellen");
      return res.json();
    },

    onError: () => {
      toast.error("Fehler beim Erstellen");
    },

    onSuccess: () => {
      toast.success("Invitation gesendet!");

      if (onSuccessReset) onSuccessReset();
    },
  });
}
