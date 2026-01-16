"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks";
import { ROUTES } from "@/lib/api-routes";

export default function DeleteLastInvoiceButton({
  hasInvoices,
}: {
  hasInvoices: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { orgRole } = useAuth();
  const queryClient = useQueryClient();

  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const deleteLastInvoice = useMutation({
    mutationFn: async () => {
      const res = await fetch(ROUTES.INVOICES_LAST, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Löschen der Rechnung");
      }
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "invoices" ||
          query.queryKey[0] === "organization-logs",
      });
      setOpen(false);
      toast.success("Rechnung gelöscht!");
    },
    onError: (error) => {
      setApiError(error.message);
      toast.error(error.message);
      setOpen(false);
    },
  });

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";

      const focusables = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusables?.[0]?.focus();
    } else {
      document.body.style.overflow = "";
      if (triggerButtonRef.current) {
        triggerButtonRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const trapFocus = (e: React.KeyboardEvent) => {
    if (!open) return;

    if (e.key === "Escape") {
      setOpen(false);
      return;
    }

    if (e.key !== "Tab") return;

    const focusables = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusables || focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
      return;
    }

    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerButtonRef}
        type="button"
        onClick={() => setOpen(true)}
        disabled={!hasInvoices || deleteLastInvoice.isPending}
        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
      >
        Letzte Rechnung löschen
      </button>
      {apiError && <p className="text-red-600 mt-2 text-xs">{apiError}</p>}
      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black-rgba flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          onKeyDown={trapFocus}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full !opacity-100"
          >
            <h2 className="text-lg font-semibold mb-2">Sicher löschen?</h2>
            <p className="text-sm text-gray-600 mb-4">
              Diese Aktion kann <strong>nicht</strong> rückgängig gemacht
              werden. Die letzte Rechnung wird endgültig gelöscht.
            </p>
            {orgRole === "member" && (
              <p className="text-sm text-red-600 mb-4">
                <strong>Wichtig:</strong> Es können nur Rechnungen gelöscht
                werden, die Sie selbst erstellt haben.
              </p>
            )}
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
