"use client";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
};

export function MobileMenu({ children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("mobileMenu");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-full bg-gray-200 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
        aria-label={isOpen ? t("close") : t("open")}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-black dark:text-white" />
        ) : (
          <Menu className="w-6 h-6 text-black dark:text-white" />
        )}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 bg-black/50 z-199 md:hidden cursor-default"
            onClick={() => setIsOpen(false)}
            aria-label={t("close")}
            tabIndex={-1}
          />
          <nav
            id="mobile-menu"
            className="absolute top-full right-0 mt-2 mr-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-201 md:hidden"
            aria-label={t("navigation")}
          >
            <div className="flex flex-col gap-2 p-3">{children}</div>
          </nav>
        </>
      )}
    </>
  );
}
