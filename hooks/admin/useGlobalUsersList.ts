"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { admin } from "@/lib/auth-client";

export function useGlobalUsersList(options?: { searchValue?: string }) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["global-users-list", options?.searchValue],
    queryFn: async () => {
      const { data, error } = await admin.listUsers({
        query: { limit: 50, sortBy: "createdAt", sortDirection: "desc" },
      });
      if (error) throw new Error(error.message);
      return data.users;
    },
  });

  const setRole = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "admin" | "user";
    }) => {
      const { error } = await admin.setRole({ userId, role });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global-users-list"] });
    },
  });

  const setBan = useMutation({
    mutationFn: async ({
      userId,
      ban,
      reason,
      expires,
    }: {
      userId: string;
      ban: boolean;
      reason?: string;
      expires?: number;
    }) => {
      if (ban) {
        await admin.banUser({
          userId,
          banReason: reason,
          banExpiresIn: expires,
        });
      } else {
        await admin.unbanUser({ userId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global-users-list"] });
    },
  });

  return { ...query, setRole, setBan };
}
