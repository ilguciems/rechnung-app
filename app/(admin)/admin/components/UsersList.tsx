"use client";
import {
  Ban,
  LoaderCircle,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useGlobalUsersList } from "@/hooks";
import { useSession } from "@/lib/auth-client";

export default function UsersList() {
  const { data: users, isLoading, setRole, setBan } = useGlobalUsersList();
  const { data: session } = useSession();

  const handleRoleChange = (userId: string, currentRole: "admin" | "user") => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (confirm(`Benutzerrolle auf ${newRole} ändern?`)) {
      setRole.mutate({ userId, role: newRole });
    }
  };

  const handleBanToggle = (userId: string, isBanned: boolean) => {
    const action = isBanned ? "entsperren" : "sperren";
    if (confirm(`Sind Sie sicher, dass Sie den Benutzer ${action} möchten?`)) {
      setBan.mutate({ userId, ban: !isBanned });
    }
  };

  return (
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
          {users?.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
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
                    {user.id === session?.user.id ? "Mein Konto" : user.role}
                  </span>
                  {user.banned && (
                    <span className="bg-red-100 text-red-700 w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      Banned
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleRoleChange(user.id, user.role as "admin" | "user")
                    }
                    disabled={setRole.isPending || user.id === session?.user.id}
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
                    onClick={() => handleBanToggle(user.id, !!user.banned)}
                    disabled={setBan.isPending || user.id === session?.user.id}
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
            </tr>
          ))}
        </tbody>
      </table>
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center rounded-xl">
          <LoaderCircle className="animate-spin w-12 h-12 text-blue-500" />
        </div>
      )}
    </div>
  );
}
