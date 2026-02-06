"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Mail, Paperclip, Send, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { type EmailFormValues, emailSchema, useSendEmail } from "@/hooks";
import type { Invoice } from "../helpers";

const levels = [
  { id: 0, label: "Rechnung" },
  { id: 1, label: "Zahlungserrinnung" },
  { id: 2, label: "1. Mahnung" },
  { id: 3, label: "2. Mahnung" },
];

const getDeadlineDate = (days: number = 14) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("de-DE");
};

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
  const modalRef = useRef<HTMLDivElement>(null);

  const activeStepIndex = type === "invoice" ? 0 : level;

  const nextLevel =
    type === "reminder"
      ? Math.min((invoice.lastReminderLevel || 0) + 1, 3)
      : undefined;

  const { mutate, isPending } = useSendEmail(invoice.id, type, nextLevel);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
  });

  useEffect(() => {
    if (isOpen) {
      const deadlineDate = getDeadlineDate();
      let subject = "";
      let message = "";

      if (type === "invoice") {
        subject = `Rechnung ${invoice.invoiceNumber}`;
        message = `Sehr geehrte(r) ${invoice.customerName},\n\nanbei erhalten Sie die Rechnung ${invoice.invoiceNumber}. Wir bitten um zeitnahe Begleichung.`;
      } else {
        switch (level) {
          case 1: // Zahlungserinnerung
            subject = `Zahlungserinnerung zur Rechnung ${invoice.invoiceNumber}`;
            message = `Sehr geehrte(r) ${invoice.customerName},\n\nsicherlich haben Sie übersehen, die Rechnung ${invoice.invoiceNumber} zu begleichen. Wir bitten Sie, dies in den nächsten Tagen nachzuholen.`;
            break;
          case 2: // 1. Mahnung
            subject = `1. Mahnung zur Rechnung ${invoice.invoiceNumber}`;
            message = `Sehr geehrte(r) ${invoice.customerName},\n\nleider konnten wir bisher keinen Zahlungseingang zur Rechnung ${invoice.invoiceNumber} feststellen. Bitte überweisen Sie den fälligen Betrag bis spätestens zum ${deadlineDate}.`;
            break;
          case 3: // 2. Mahnung / Letzte Mahnung
            subject = `LETZTE MAHNUNG zur Rechnung ${invoice.invoiceNumber}`;
            message = `Sehr geehrte(r) ${invoice.customerName},\n\nauf unsere bisherigen Mahnungen haben Sie nicht reagiert. Dies ist die letzte Mahnung. Sollte die Zahlung nicht bis zum ${deadlineDate} bei uns eingehen, sehen wir uns gezwungen, rechtliche Schritte einzuleiten.`;
            break;
        }
      }

      reset({
        to: invoice.customerEmail || "",
        subject: subject,
        message: message,
      });
    }
  }, [isOpen, invoice, type, level, reset]);

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

  const onSubmit = (data: EmailFormValues) => {
    mutate(data, {
      onSuccess: () => onClose(),
    });
  };

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
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-4">
            <div>
              <label
                htmlFor="to"
                className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1"
              >
                Empfänger E-Mail
              </label>
              <input
                {...register("to")}
                className={`w-full px-4 py-2 bg-slate-50 border rounded-xl text-sm outline-none transition-all ${
                  errors.to
                    ? "border-red-500 focus:ring-red-200"
                    : "border-slate-200 focus:ring-black"
                }`}
              />
              {errors.to && (
                <p className="text-[10px] text-red-500 mt-1 -mb-4.5">
                  {errors.to.message}
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
                {...register("subject")}
                className={`w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-black outline-none ${
                  errors.subject
                    ? "border-red-500 focus:ring-red-200"
                    : "border-slate-200 focus:ring-black"
                }`}
              />
              {errors.subject && (
                <p className="text-[10px] text-red-500 mt-1 -mb-4.5">
                  {errors.subject.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1"
              >
                Nachricht
              </label>
              <textarea
                {...register("message")}
                rows={4}
                className={`w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-black outline-none resize-none ${
                  errors.message
                    ? "border-red-500 focus:ring-red-200"
                    : "border-slate-200 focus:ring-black"
                }`}
              />
              {errors.message && (
                <p className="text-[10px] text-red-500 mt-1 -mb-4.5">
                  {errors.message.message}
                </p>
              )}
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
              <p className="text-[10px] text-slate-500">
                PDF-Dokument angehängt
              </p>
            </div>
            {level === 1 && type === "reminder" && (
              <div className="flex-1">
                <p className="text-[11px] font-bold text-black uppercase tracking-tight">
                  {`kopie-invoice-${invoice.invoiceNumber}.pdf`}
                </p>
                <p className="text-[10px] text-slate-500">
                  PDF-Dokument angehängt
                </p>
              </div>
            )}
            <Paperclip className="w-4 h-4 text-slate-400" />
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-black transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:bg-slate-300 transition-all shadow-lg shadow-black/10"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Senden
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
