"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";

export function useAuth() {
  const { data: session, isPending: isSessionPending } = useSession();

  const { data: orgData, isLoading: isOrgPending } = useQuery({
    queryKey: ["organization-role", session?.user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/organization/role`);
      if (!res.ok) throw new Error("Failed to fetch role");
      const data = await res.json();
      return data;
    },
    enabled: !!session?.user?.id,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  return {
    session,
    user: session?.user,
    orgRole: orgData?.role ?? null,
    orgId: orgData?.id ?? null,
    isLoading: isSessionPending || isOrgPending,
    isGlobalAdmin: session?.user?.role === "admin",
    isOrgAdmin: orgData?.role === "admin",
  };
}
