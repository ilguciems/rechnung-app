"use client";

import { Ban, LoaderCircle, ShieldAlert, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ConfirmationModal } from "@/app/components";
import { useAuth, useMembership } from "@/hooks";

export default function MembershipList() {
  const t = useTranslations("organization.members");
  const {
    data: memberships,
    isLoading,
    changeRole,
    deleteMembership,
  } = useMembership();
  const { session, orgId } = useAuth();

  const roleLabels = useMemo(
    () => ({
      admin: t("admin"),
      member: t("member"),
    }),
    [t],
  );

  const [modalConfig, setModalConfig] = useState<{
    type: "role" | "delete";
    userId: string;
    userName: string;
    currentVal?: string | undefined | null | boolean;
  } | null>(null);

  const closeAndReset = () => {
    setModalConfig(null);
  };

  const handleConfirm = () => {
    if (!modalConfig) return;

    if (modalConfig.type === "role") {
      const newRole = modalConfig.currentVal === "admin" ? "member" : "admin";
      changeRole.mutate(
        { userId: modalConfig.userId, role: newRole },
        { onSuccess: closeAndReset },
      );
    } else {
      deleteMembership.mutate(
        {
          userId: modalConfig.userId,
        },
        { onSuccess: closeAndReset },
      );
    }
  };

  if (memberships?.length === 1) {
    return (
      <div className="p-4 text-sm text-slate-500 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800 rounded-lg border border-dashed border-slate-200">
        {t.rich("empty", {
          link: (chunks) => (
            <Link
              href={`/organization/${orgId}/admin?tab=invitations`}
              className="font-medium underline underline-offset-4 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              {chunks}
            </Link>
          ),
        })}
      </div>
    );
  }

  return (
    <>
      <ul className="rounded-xl border border-gray-200 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700 relative">
        {memberships?.map(({ role, user }) => {
          const isAdmin = role === "admin";
          if (user.id === session?.user.id) return null;
          return (
            <li
              key={user.id}
              className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="col-span-4 sm:col-span-2">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>

              <div className={`text-sm font-medium col-span-2 sm:col-span-1 `}>
                <span
                  title={roleLabels[role as keyof typeof roleLabels] ?? role}
                  className={`w-fit px-2 py-0.5 rounded text-[12px] font-bold uppercase ${
                    isAdmin
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {roleLabels[role as keyof typeof roleLabels] ?? role}
                </span>
              </div>
              <div className="text-sm font-medium col-span-2 sm:col-span-1 text-right">
                <button
                  type="button"
                  title={isAdmin ? t("removeAdmin") : t("makeAdmin")}
                  onClick={() =>
                    setModalConfig({
                      type: "role",
                      userName: user.name,
                      userId: user.id,
                      currentVal: role,
                    })
                  }
                  disabled={
                    changeRole.isPending || user.id === session?.user.id
                  }
                  className="p-2 rounded hover:bg-gray-100 text-gray-600 cursor:pointer dark:hover:bg-gray-600"
                >
                  {role === "admin" ? (
                    <ShieldAlert className="w-6 h-6 text-amber-600" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 text-slate-700 dark:text-slate-400" />
                  )}
                </button>
                <button
                  type="button"
                  title={t("leave")}
                  onClick={() =>
                    setModalConfig({
                      type: "delete",
                      userId: user.id,
                      userName: user.name,
                    })
                  }
                  disabled={
                    deleteMembership.isPending || user.id === session?.user.id
                  }
                  className="p-2 rounded hover:bg-gray-100 text-gray-600 dark:hover:bg-gray-600 cursor:pointer"
                >
                  <Ban className="w-6 h-6 text-red-600" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center rounded-xl dark:bg-gray-900/80">
          <LoaderCircle className="animate-spin w-12 h-12 text-blue-500" />
        </div>
      )}
      <ConfirmationModal
        isOpen={!!modalConfig}
        title={
          modalConfig?.type === "role" ? t("changeRole") : t("endMembership")
        }
        description={
          modalConfig?.type === "role"
            ? t("changeRoleConfirm", { name: modalConfig?.userName ?? "" })
            : t("endMembershipConfirm", { name: modalConfig?.userName ?? "" })
        }
        isPending={changeRole.isPending || deleteMembership.isPending}
        onClose={() => setModalConfig(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
