"use client";

import { AnimatePresence, motion } from "framer-motion";
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
  const { data: company, isLoading: isCompanyLoading } = useCompany();
  const { isOrgAdmin, orgId, isLoading: isAuthLoading } = useAuth();

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
        <div className="p-5 border border-gray-200 rounded-lg bg-red-100 text-gray-700 space-y-2">
          <p className="font-medium text-gray-900">Willkommen, {userName}!</p>
          <p>
            Sie können entweder ein neues Unternehmen erstellen oder auf eine
            Einladung warten, um einer bestehenden Organisation beizutreten.
          </p>
          <p className="text-sm text-gray-600">
            <strong>Hinweis:</strong> Wenn Sie ein eigenes Unternehmen
            erstellen, können Sie mit diesem Konto später keiner anderen
            Organisation mehr beitreten.
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
    </div>
  );
}
