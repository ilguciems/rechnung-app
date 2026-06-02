"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("invoicesList.deleteLast");

  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const deleteLastInvoice = useMutation({
    mutationFn: async () => {
      const res = await fetch(ROUTES.INVOICES_LAST, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? t("error"));
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
      toast.success(t("success"));
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
        {t("button")}
      </button>
      {apiError && <p className="text-red-600 mt-2 text-xs">{apiError}</p>}
      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-gray-950-rgba flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          onKeyDown={trapFocus}
        >
          <div
            ref={modalRef}
            className="bg-white dark:bg-gray-950 rounded-lg shadow-lg p-6 max-w-sm w-full opacity-100!"
          >
            <h2 className="text-lg font-semibold mb-2">{t("modalTitle")}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-200 mb-4">
              {t.rich("modalText", {
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </p>
            {orgRole === "member" && (
              <p className="text-sm text-red-600 mb-4">
                {t.rich("modalWarning", {
                  strong: (chunks) => <strong>{chunks}</strong>,
                })}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={() => deleteLastInvoice.mutate()}
                disabled={deleteLastInvoice.isPending}
                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-70"
              >
                {deleteLastInvoice.isPending ? t("deleting") : t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
