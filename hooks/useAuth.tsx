"use client";

import { useQuery } from "@tanstack/react-query";
import { ROUTES } from "@/lib/api-routes";
import { useSession } from "@/lib/auth-client";

export function useAuth() {
  const { data: session, isPending: isSessionPending } = useSession();

  const { data: orgData, isLoading: isOrgPending } = useQuery({
    queryKey: ["membership-data", session?.user?.id],
    queryFn: async () => {
      const res = await fetch(ROUTES.ORGANIZATION_MEMBERSHIP);
      if (!res.ok) throw new Error("Failed to fetch membership data");
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
    ogrName: orgData?.name ?? null,
    isLoading: isSessionPending || isOrgPending,
    isGlobalAdmin: session?.user?.role === "admin",
    isOrgAdmin: orgData?.role === "admin",
  };
}
