"use client";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, Mail, Paperclip, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import type { Invoice } from "../helpers";

const levels = [
  { id: 0, label: "Rechnung" },
  { id: 1, label: "Zahlungserrinnung" },
  { id: 2, label: "1. Mahnung" },
  { id: 3, label: "2. Mahnung" },
];

export function SendEmailModal({
  invoice,
  type = "invoice", // "invoice" | "reminder"
  level = 1,
  isOpen,
  onClose,
}: {
  invoice: Invoice;
  type: "invoice" | "reminder";
  level?: 1 | 2 | 3;
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const modalRef = useRef<HTMLDivElement>(null);

  const [emailData, setEmailData] = useState({
    to: invoice.customerEmail || "",
    subject:
      type === "invoice"
        ? `Rechnung ${invoice.invoiceNumber}`
        : `${level === 1 ? "Zahlungserinnerung" : `${level - 1}. Mahnung`} zur Rechnung ${invoice.invoiceNumber}`,
    message:
      type === "invoice"
        ? `Sehr geehrte(r) ${invoice.customerName},\n\nanbei erhalten Sie Ihre Rechnung ${invoice.invoiceNumber}.`
        : `Sehr geehrte(r) ${invoice.customerName},\n\ndies ist eine freundliche Erinnerung zur Rechnung ${invoice.invoiceNumber}.`,
  });

  const [loading, setLoading] = useState(false);

  const currentLevel = invoice.lastReminderLevel || 0;
  const nextLevel = Math.min(currentLevel + 1, 3);
  const activeStepIndex = type === "invoice" ? 0 : level;

  const handleSend = async () => {
    if (!emailData.to.includes("@")) {
      toast.error("Bitte eine gültige E-Mail-Adresse eingeben");
      return;
    }

    const endpoint =
      type === "invoice"
        ? `/api/invoices/${invoice.id}/send-invoice`
        : `/api/invoices/${invoice.id}/send-reminder?level=${nextLevel}`;

    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(emailData),
      });
      if (!res.ok) throw new Error("Versand fehlgeschlagen");
      toast.success("E-Mail wurde versendet");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Fehler beim Senden");
    } finally {
      setLoading(false);
    }
  };

  const trapFocus = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
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
      // Shift + Tab
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";

      const focusables = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusables?.[1]?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onKeyDown={trapFocus}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div
        ref={modalRef}
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-black" />
            <h3 className="font-bold text-black uppercase tracking-tight text-sm">
              {type === "invoice" ? "Rechnung senden" : "Mahnung senden"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-16 pb-8 pt-2 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center justify-between relative max-w-md mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-slate-200 -translate-y-1/2 z-0" />

            {levels.map((step, index) => {
              const isCompleted =
                index === 0
                  ? !!invoice.invoiceSentAt
                  : index <= (invoice.lastReminderLevel || 0);

              const isCurrentAction = index === activeStepIndex;

              return (
                <div
                  key={step.id}
                  className="relative z-10 flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-3 h-3 rounded-full border-2 transition-all duration-500 ${
                      isCompleted
                        ? "bg-black border-black shadow-[0_0_0_4px_rgba(0,0,0,0.05)]"
                        : isCurrentAction
                          ? "bg-white border-black animate-pulse shadow-[0_0_0_4px_rgba(0,0,0,0.1)]"
                          : "bg-slate-200 border-slate-200"
                    }`}
                  />

                  <div className="absolute -bottom-6 whitespace-nowrap flex flex-col items-center">
                    <span
                      className={`text-[9px] font-black uppercase tracking-tighter ${
                        isCompleted || isCurrentAction
                          ? "text-black"
                          : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                    {isCompleted && (
                      <span className="text-[8px] text-emerald-600 font-bold leading-none">
                        VERSENDET
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label
              htmlFor="to"
              className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1"
            >
              Empfänger E-Mail
            </label>
            <input
              id="to"
              type="email"
              value={emailData.to}
              onChange={(e) =>
                setEmailData({ ...emailData, to: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="email@beispiel.de"
            />
            {!invoice.customerEmail && (
              <p className="text-[10px] text-amber-600 mt-1 ml-1 font-medium">
                ⚠️ Keine E-Mail im Datensatz gefunden. Bitte manuell eingeben.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1"
            >
              Betreff
            </label>
            <input
              id="subject"
              type="text"
              value={emailData.subject}
              onChange={(e) =>
                setEmailData({ ...emailData, subject: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-black outline-none tracking-tight"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1"
            >
              Nachricht
            </label>
            <textarea
              id="message"
              rows={4}
              value={emailData.message}
              onChange={(e) =>
                setEmailData({ ...emailData, message: e.target.value })
              }
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-black outline-none resize-none"
            />
          </div>
        </div>
        <div className="mt-4 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <FileText className="w-5 h-5 text-black" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold text-black uppercase tracking-tight">
              {type === "invoice"
                ? `invoice-${invoice.invoiceNumber}.pdf`
                : `${level === 1 ? "zahlungserinnerung" : `mahnung-${level - 1}`}-${invoice.invoiceNumber}.pdf`}
            </p>
            <p className="text-[10px] text-slate-500">PDF-Dokument angehängt</p>
          </div>
          <Paperclip className="w-4 h-4 text-slate-400" />
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-black transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:bg-slate-300 transition-all shadow-lg shadow-black/10"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            Senden
          </button>
        </div>
      </div>
    </div>
  );
}
