"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ROUTES } from "@/lib/api-routes";
import {
  CompanySection,
  InvoiceSection,
  InvoicesListSection,
  UploadLogoSection,
} from "./components";

import StartLoadingScreen from "./components/StartLoadingScreen";

export default function Home() {
  const { data: company, isLoading } = useQuery({
    queryKey: ["company"],
    queryFn: async () => {
      const res = await fetch(ROUTES.COMPANY);
      if (!res.ok) throw new Error("Fehler beim Laden der Firma");
      return res.json();
    },
  });

  return (
    <main
      role={isLoading ? "status" : undefined}
      aria-live={isLoading ? "polite" : undefined}
      className="p-6 max-w-3xl mx-auto space-y-8"
    >
      {isLoading && <StartLoadingScreen />}

      <UploadLogoSection />
      <CompanySection />

      <AnimatePresence>
        {company && (
          <motion.div
            key="invoices"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <InvoiceSection />
            <InvoicesListSection />
          </motion.div>
        )}
        {!company && !isLoading && (
          <motion.section
            key="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="alert"
            aria-live="polite"
            className="p-4 border rounded bg-gray-50 text-gray-700"
          >
            Bitte geben Sie zunächst Ihre Unternehmensdaten ein, um mit der
            Rechnungserstellung fortzufahren.
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
