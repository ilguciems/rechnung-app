"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { ROUTES } from "@/lib/api-routes";

export default function DeleteLastInvoiceButton({
  hasInvoices,
}: {
  hasInvoices: boolean;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteLastInvoice = useMutation({
    mutationFn: async () => {
      const res = await fetch(ROUTES.INVOICES_LAST, { method: "DELETE" });
      if (!res.ok) throw new Error("Fehler beim Löschen");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setOpen(false); // close if success
      toast.success("Rechnung gelöscht!");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Fehler beim Löschen der Rechnung");
      setOpen(false); // close if error
    },
  });

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!hasInvoices || deleteLastInvoice.isPending}
        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
      >
        Letzte Rechnung löschen
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black opacity-95 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full !opacity-100">
            <h2 className="text-lg font-semibold mb-2">Sicher löschen?</h2>
            <p className="text-sm text-gray-600 mb-4">
              Diese Aktion kann <strong>nicht</strong> rückgängig gemacht
              werden. Die letzte Rechnung wird endgültig gelöscht.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={() => deleteLastInvoice.mutate()}
                disabled={deleteLastInvoice.isPending}
                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-70"
              >
                {deleteLastInvoice.isPending ? "Lösche..." : "Löschen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
