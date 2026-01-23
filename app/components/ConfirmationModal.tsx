"use client";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  isPending?: boolean;
  children?: React.ReactNode;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Bestätigen",
  isPending,
  children,
}: ConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

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
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";

      const focusables = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusables?.[1]?.focus();
    } else {
      document.body.style.overflow = "";
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      onKeyDown={trapFocus}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200 relative"
      >
        <button
          type="button"
          aria-labelledby="Schließen"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors"
          onClick={onClose}
        >
          <X className="h-6 w-6 " />
        </button>
        <h2 className="text-xl font-bold mb-2 text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mb-4">{description}</p>

        {children && <div className="mb-4 space-y-3">{children}</div>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition-colors"
          >
            {isPending ? "Lädt..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
