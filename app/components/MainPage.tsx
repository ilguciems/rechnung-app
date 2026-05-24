"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAuth, useCompany } from "@/hooks";
import {
  CompanySection,
  InviteWarningModal,
  InvoiceSection,
  InvoicesListSection,
  MemberCompanyView,
  StartLoadingScreen,
  UploadLogoSection,
} from "./";

type MainPageProps = {
  hasPendingInvite: boolean;
  userName: string;
};

export default function MainPage({
  hasPendingInvite,
  userName,
}: MainPageProps) {
  const t = useTranslations("mainPage");
  const { data: company, isLoading: isCompanyLoading } = useCompany();
  const { isOrgAdmin, orgId, isLoading: isAuthLoading } = useAuth();

  const shouldReduceMotion = useReducedMotion();

  const isLoading = isCompanyLoading || isAuthLoading;
  const canCreateOrEditCompany = !orgId || isOrgAdmin;

  if (isLoading) return <StartLoadingScreen />;

  return (
    <div
      role={isLoading ? "status" : undefined}
      aria-live={isLoading ? "polite" : undefined}
      className="p-6 max-w-3xl mx-auto space-y-8"
      aria-busy={isLoading}
      aria-hidden={isLoading}
    >
      {hasPendingInvite && <InviteWarningModal />}
      {!isLoading && !company && (
        <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-5 text-gray-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-gray-300">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {t("welcome", { userName })}
          </p>
          <p>{t("description")}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t.rich("note", {
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </p>
        </div>
      )}

      {canCreateOrEditCompany ? (
        <>
          <UploadLogoSection />
          <CompanySection />
        </>
      ) : (
        <MemberCompanyView />
      )}

      <AnimatePresence>
        {company && (
          <motion.div
            key="invoices"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={
              shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }
            }
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
            transition={
              shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }
            }
            role="alert"
            aria-live="polite"
            className="rounded border border-gray-200 bg-gray-50 p-4 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            {t("enterCompanyData")}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
