"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export default function Pagination({
  page,
  totalPages,
  onChange,
}: PaginationProps) {
  const t = useTranslations("invoicesList.pagination");

  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex justify-center items-center gap-4 mt-5"
      aria-label={t("navigation")}
    >
      {/* Prev */}
      <button
        type="button"
        disabled={page <= 1}
        aria-disabled={page <= 1}
        aria-label={t("previous")}
        onClick={() => onChange(page - 1)}
        className="px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded disabled:opacity-50 cursor-pointer"
      >
        <span className="flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> {t("back")}
        </span>
      </button>

      {/* Info */}
      <span className="text-sm text-gray-700 dark:text-gray-400">
        {t("pageInfo", { page, totalPages })}
      </span>

      {/* Next */}
      <button
        type="button"
        disabled={page >= totalPages}
        aria-disabled={page >= totalPages}
        aria-label={t("next")}
        onClick={() => onChange(page + 1)}
        className="px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded disabled:opacity-50 cursor-pointer"
      >
        <span className="flex items-center gap-1">
          {t("forward")} <ChevronRight className="w-4 h-4" />
        </span>
      </button>
    </nav>
  );
}
