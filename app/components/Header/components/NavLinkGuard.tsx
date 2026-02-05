"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks";

type Props = {
  serverOrgId?: string;
  children: React.ReactNode;
};

export function NavLinkGuard({ serverOrgId, children }: Props) {
  const { orgId, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!serverOrgId && orgId && !isLoading) {
      router.refresh();
    }
  }, [orgId, serverOrgId, isLoading, router]);

  const canShow = !!serverOrgId || !!orgId;

  if (!canShow) return null;

  return <>{children}</>;
}
