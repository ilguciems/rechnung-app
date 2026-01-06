"use client";

import { useRouter } from "next/navigation";
import { useInviteAccept } from "@/hooks";

export default function InviteConfirm({ token }: { token: string }) {
  const router = useRouter();

  const acceptInvite = useInviteAccept(() => {
    router.push("/");
  });

  return (
    <div className="p-8 text-center">
      <h1 className="text-xl font-semibold">Einladung zur Organisation</h1>
      <p className="text-gray-500 mt-2">
        Möchten Sie der Organisation beitreten?
      </p>

      <button
        type="button"
        disabled={acceptInvite.isPending}
        onClick={() => acceptInvite.mutate(token)}
        className="mt-6 px-6 py-2 bg-black text-white rounded disabled:opacity-50"
      >
        {acceptInvite.isPending ? "Bitte warten..." : "Beitreten"}
      </button>
    </div>
  );
}
