"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ROUTES } from "@/lib/api-routes";

export function useInviteAccept(onSuccessRedirect?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (token: string) => {
      const res = await fetch(ROUTES.INVITE_ORGANIZATION_ACCEPT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Akzeptieren");
      }
    },

    onSuccess: () => {
      toast.success("Einladung angenommen!");
      queryClient.invalidateQueries({ queryKey: ["membership-my"] });
      onSuccessRedirect?.();
    },

    onError: (err) => {
      toast.error(err.message);
    },
  });
}
