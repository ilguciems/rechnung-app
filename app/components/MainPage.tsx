"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCompany } from "@/hooks";
import {
  CompanySection,
  InvoiceSection,
  InvoicesListSection,
  StartLoadingScreen,
  UploadLogoSection,
} from "./";

export default function MainPage() {
  const { data: company, isLoading } = useCompany();

  if (isLoading) return <StartLoadingScreen />;

  return (
    <main
      role={isLoading ? "status" : undefined}
      aria-live={isLoading ? "polite" : undefined}
      className="p-6 max-w-3xl mx-auto space-y-8"
      aria-busy={isLoading}
      aria-hidden={isLoading}
    >
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
