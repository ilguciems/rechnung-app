import { ChevronLeft, ChevronRight } from "lucide-react";
import { useId } from "react";
import { dotts, usePaginationLogic } from "./usePaginationLogic";

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
  const uniqueId = useId();
  const pages = usePaginationLogic(page, totalPages);

  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  const baseCircle =
    "w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-all";

  return (
    <nav className="flex items-center justify-center gap-2 my-4">
      <button
        type="button"
        onClick={() => !isFirst && onChange(page - 1)}
        disabled={isFirst}
        className={`${baseCircle} ${
          isFirst
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-800 cursor-pointer shadow-sm"
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-1">
        {pages.map((p: number | string, i: number) => {
          if (p === dotts) {
            return (
              <span
                key={
                  i < pages.length / 2
                    ? `${uniqueId}-dot-left`
                    : `${uniqueId}-dot-right`
                }
                className="w-10 text-center text-gray-400 font-bold select-none"
              >
                {dotts}
              </span>
            );
          }

          const isActive = p === page;

          return (
            <button
              type="button"
              key={`${uniqueId}-page-${p}`}
              onClick={() => onChange(p as number)}
              className={`${baseCircle} ${
                isActive
                  ? "bg-black text-white shadow-md scale-110 z-10"
                  : "bg-transparent text-black hover:bg-gray-100 cursor-pointer"
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => !isLast && onChange(page + 1)}
        disabled={isLast}
        className={`${baseCircle} ${
          isLast
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-800 cursor-pointer shadow-sm"
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
}
