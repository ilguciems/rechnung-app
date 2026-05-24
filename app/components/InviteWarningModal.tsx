"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export function InviteWarningModal() {
  const t = useTranslations("inviteWarning");
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t("title")}
        </h2>

        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          {t.rich("message", {
            br: () => <br />,
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md bg-black px-4 py-2 text-sm text-white transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
          >
            {t("understood")}
          </button>
        </div>
      </div>
    </div>
  );
}
