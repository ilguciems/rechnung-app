"use client";
import {
  Ban,
  LoaderCircle,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { useGlobalUsersList } from "@/hooks";
import { useSession } from "@/lib/auth-client";
import ConfirmationModal from "./ConfirmationModal";

export default function UsersList() {
  const { data: users, isLoading, setRole, setBan } = useGlobalUsersList();
  const { data: session } = useSession();

  const [modalConfig, setModalConfig] = useState<{
    type: "role" | "ban";
    userId: string;
    userName: string;
    currentVal: string | undefined | null | boolean;
  } | null>(null);

  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("0"); // в днях, 0 = навсегда

  const closeAndReset = () => {
    setModalConfig(null);
    setBanReason("");
    setBanDuration("0");
  };

  const handleConfirm = () => {
    if (!modalConfig) return;

    if (modalConfig.type === "role") {
      const newRole = modalConfig.currentVal === "admin" ? "user" : "admin";
      setRole.mutate(
        { userId: modalConfig.userId, role: newRole },
        { onSuccess: closeAndReset },
      );
    } else {
      const isBanning = !modalConfig.currentVal;
      const expires =
        banDuration !== "0"
          ? parseInt(banDuration, 10) * 24 * 60 * 60
          : undefined;

      setBan.mutate(
        {
          userId: modalConfig.userId,
          ban: isBanning,
          reason: isBanning ? banReason : undefined,
          expires: isBanning ? expires : undefined,
        },
        { onSuccess: closeAndReset },
      );
    }
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-bold">
            <tr>
              <th className="px-6 py-4">Benutzer</th>
              <th className="px-6 py-4">Rolle / Status</th>
              <th className="px-6 py-4 text-right">Aktions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users?.map((user) => {
              if (user.id === session?.user.id) return null;
              const isActionsAllowed = user.role !== "superadmin";
              return (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-gray-500 text-xs">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`w-fit px-2 py-0.5 rounded text-[12px] font-bold uppercase ${
                          user.role === "admin"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.role}
                      </span>
                      {user.banned && (
                        <>
                          <span className="bg-red-100 text-red-700 w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            {`Gesperrt ${user.banExpires ? `bis ${new Date(user.banExpires).toLocaleDateString()}` : "permanent"}`}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {`Grund: ${user.banReason && user.banReason !== "No reason" ? `${user.banReason}` : "nicht angegeben"} `}
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  {isActionsAllowed && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setModalConfig({
                              type: "role",
                              userId: user.id,
                              userName: user.name,
                              currentVal: user.role,
                            })
                          }
                          disabled={
                            setRole.isPending || user.id === session?.user.id
                          }
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Rolle ändern"
                        >
                          {user.role === "admin" ? (
                            <ShieldAlert className="w-6 h-6 text-amber-600" />
                          ) : (
                            <ShieldCheck className="w-6 h-6 text-blue-600" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setModalConfig({
                              type: "ban",
                              userId: user.id,
                              userName: user.name,
                              currentVal: user.banned,
                            })
                          }
                          disabled={
                            setBan.isPending || user.id === session?.user.id
                          }
                          className="p-2 hover:bg-red-50 rounded-lg"
                          title={user.banned ? "Entsperren" : "Sperren"}
                        >
                          {user.banned ? (
                            <UserCheck className="w-6 h-6 text-green-600" />
                          ) : (
                            <Ban className="w-6 h-6 text-red-600" />
                          )}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center rounded-xl">
            <LoaderCircle className="animate-spin w-12 h-12 text-blue-500" />
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={!!modalConfig}
        onClose={closeAndReset}
        onConfirm={handleConfirm}
        isPending={setRole.isPending || setBan.isPending}
        title={
          modalConfig?.type === "role"
            ? "Rolle ändern"
            : modalConfig?.currentVal
              ? "Entsperren"
              : "Benutzer sperren"
        }
        description={
          modalConfig?.type === "role"
            ? `Möchten Sie die Rolle von ${modalConfig?.userName} wirklich ändern?`
            : `Aktion für Benutzer ${modalConfig?.userName} bestätigen.`
        }
      >
        {modalConfig?.type === "ban" && !modalConfig.currentVal && (
          <div className="space-y-3 pt-2">
            <div className="grid relative mb-4">
              <label
                htmlFor="ban-reason"
                className="text-xs text-gray-700 px-2 absolute -top-2 left-2 z-10 bg-white"
              >
                Grund (optional)
              </label>
              <div className="relative">
                <input
                  id="ban-reason"
                  className="border p-2 rounded w-full border-gray-500"
                  placeholder="z.B. Verstoß gegen Regeln"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
              </div>
            </div>
            <div className="grid relative mb-4">
              <label
                htmlFor="ban-duration"
                className="text-xs text-gray-700 px-2 absolute -top-2 left-2 bg-white"
              >
                Dauer
              </label>
              <select
                id="ban-duration"
                className="border p-2 rounded w-full border-gray-500 min-h-[2.5rem]"
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
              >
                <option value="0">Permanent</option>
                <option value="1">1 Tag</option>
                <option value="7">7 Tage</option>
                <option value="30">30 Tage</option>
              </select>
            </div>
          </div>
        )}
      </ConfirmationModal>
    </>
  );
}
