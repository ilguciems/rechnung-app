"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { admin } from "@/lib/auth-client";

export function useGlobalUsersList(options?: {
  searchValue?: string;
  limit?: number;
  sortDirection?: "asc" | "desc";
  searchField?: "email" | "name";
  searchOperator?: "contains" | "starts_with" | "ends_with";
  offset?: number;
  filterField?: string;
  filterValue?: string;
}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [
      "global-users-list",
      options?.searchValue,
      options?.limit,
      options?.sortDirection,
      options?.searchField,
      options?.searchOperator,
      options?.offset,
      options?.filterField,
      options?.filterValue,
    ],
    queryFn: async () => {
      const { data, error } = await admin.listUsers({
        query: {
          limit: options?.limit || 50,
          sortBy: "createdAt",
          sortDirection: options?.sortDirection || "desc",
          searchOperator: options?.searchOperator || "contains",
          searchField: options?.searchField || "email",
          searchValue: options?.searchValue || "",
          offset: options?.offset || 0,
          filterField: options?.filterField,
          filterValue: options?.filterValue,
        },
      });
      if (error) throw new Error(error.message);
      return data;
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
    onError: (error) => {
      toast.error(error.message);
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
        const { error } = await admin.banUser({
          userId,
          banReason: reason,
          banExpiresIn: expires,
        });
        if (error) throw new Error(error.message);
      } else {
        const { error } = await admin.unbanUser({ userId });
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global-users-list"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { ...query, setRole, setBan };
}
