"use client";

import { Ban, LoaderCircle, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { ConfirmationModal } from "@/app/components";
import { useMembership } from "@/hooks";
import { useSession } from "@/lib/auth-client";

export default function MembershipList() {
  const {
    data: memberships,
    isLoading,
    changeRole,
    deleteMembership,
  } = useMembership();
  const { data: session } = useSession();

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

  return (
    <>
      <ul className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {memberships?.map(({ role, user }) => {
          const isAdmin = role === "admin";
          if (!session || user.id === session?.user.id) return null;
          return (
            <li
              key={user.id}
              className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-gray-50"
            >
              <div className="col-span-4 sm:col-span-2">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>

              <div className={`text-sm font-medium col-span-2 sm:col-span-1 `}>
                <span
                  title={isAdmin ? "Administrator" : "Mitglied"}
                  className={`w-fit px-2 py-0.5 rounded text-[12px] font-bold uppercase ${
                    isAdmin
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {role}
                </span>
              </div>
              <div className="text-sm font-medium col-span-2 sm:col-span-1 text-right">
                <button
                  type="button"
                  title={
                    isAdmin
                      ? "Adminrechte entfernen"
                      : "Zum Administrator machen"
                  }
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
                  className="p-2 rounded hover:bg-gray-100 text-gray-600 cursor:pointer"
                >
                  {role === "admin" ? (
                    <ShieldAlert className="w-6 h-6 text-amber-600" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 text-slate-700" />
                  )}
                </button>
                <button
                  type="button"
                  title="Mitgliedschaft verlassen"
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
                  className="p-2 rounded hover:bg-gray-100 text-gray-600 cursor:pointer"
                >
                  <Ban className="w-6 h-6 text-red-600" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center rounded-xl">
          <LoaderCircle className="animate-spin w-12 h-12 text-blue-500" />
        </div>
      )}
      <ConfirmationModal
        isOpen={!!modalConfig}
        title={
          modalConfig?.type === "role"
            ? "Rolle ändern"
            : "Mitgliedschaft beenden"
        }
        description={
          modalConfig?.type === "role"
            ? `Möchten Sie die Rolle von ${modalConfig?.userName} wirklich ändern?`
            : `Sind Sie sicher, dass Sie die Mitgliedschaft von ${modalConfig?.userName} beenden wollen?`
        }
        isPending={changeRole.isPending || deleteMembership.isPending}
        onClose={() => setModalConfig(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
