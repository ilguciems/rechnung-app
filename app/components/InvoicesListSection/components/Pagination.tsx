"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

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
  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex justify-center items-center gap-4 mt-5"
      aria-label="Pagination Navigation"
    >
      {/* Prev */}
      <button
        type="button"
        disabled={page <= 1}
        aria-disabled={page <= 1}
        aria-label="Zur vorherigen Seite"
        onClick={() => onChange(page - 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
      >
        <span className="flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Zurück
        </span>
      </button>

      {/* Info */}
      <span className="text-sm text-gray-700">
        Seite {page} / {totalPages}
      </span>

      {/* Next */}
      <button
        type="button"
        disabled={page >= totalPages}
        aria-disabled={page >= totalPages}
        aria-label="Zur nächsten Seite"
        onClick={() => onChange(page + 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 cursor-pointer"
      >
        <span className="flex items-center gap-1">
          Weiter <ChevronRight className="w-4 h-4" />
        </span>
      </button>
    </nav>
  );
}
