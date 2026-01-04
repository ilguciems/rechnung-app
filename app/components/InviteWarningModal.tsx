"use client";

import { useState } from "react";

export function InviteWarningModal() {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900">
          Einladung vorhanden
        </h2>

        <p className="mt-3 text-sm text-gray-600">
          Ihnen wurde bereits eine Einladung zu einer Organisation gesendet.
          <br />
          <br />
          Wenn Sie jetzt eine eigene Firma erstellen, können Sie dieser
          Organisation später <strong>nicht mehr beitreten</strong>.
        </p>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
}
