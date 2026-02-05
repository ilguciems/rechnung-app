"use client";

import { BellRing, Square, SquareCheckBig } from "lucide-react";
import { useState } from "react";
import {
  useDownloadInvoicePdf,
  useDownloadReminderPdf,
  useInvoicesList,
  useToggleInvoicePaid,
} from "@/hooks";

import {
  ActionMenu,
  DeleteLastInvoiceButton,
  InvoicesSkeleton,
  Pagination,
  PdfLoadingModal,
  SendEmailModal,
  SKELETON_KEYS,
} from "./components";

import { getInvoiceActions, type Invoice, MAHNUNG_OPTIONS } from "./helpers";

export default function InvoicesListSection() {
  const { setSearchDebounced, isPaid, setIsPaid, page, setPage, query } =
    useInvoicesList();
  const togglePaid = useToggleInvoicePaid();

  const data = query.data;
  const invoices = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const [emailModalConfig, setEmailModalConfig] = useState<{
    invoice: Invoice;
    type: "invoice" | "reminder";
    level?: number;
  } | null>(null);

  const { downloadInvoice, loading: invoiceLoading } = useDownloadInvoicePdf();
  const { downloadReminder, loading: reminderLoading } =
    useDownloadReminderPdf();

  const handlePaidFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsPaid(e.target.value);
  };

  const handleCloseSendEmailModal = (id: string) => {
    setEmailModalConfig(null);
    requestAnimationFrame(() => {
      document
        .getElementById(`${id}-action-button`)
        ?.focus({ preventScroll: true });
    });
  };

  return (
    <>
      <div>
        <h2 className="text-xl font-semibold my-5">Gespeicherte Rechnungen</h2>
        <DeleteLastInvoiceButton hasInvoices={invoices.length > 0} />
        {/* Filter */}
        <div className="flex gap-2 my-3">
          <input
            type="text"
            placeholder="Suche nach Kunde, Kunden-Nr. oder Rechnungs-Nr..."
            onChange={(e) => setSearchDebounced(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <select
            aria-label="Bezahlt Filter"
            value={isPaid}
            onChange={handlePaidFilter}
            className="border p-2 rounded"
          >
            <option value="">Alle</option>
            <option value="true">Bezahlt</option>
            <option value="false">Offen</option>
          </select>
        </div>
        {query.isLoading ? (
          <ul
            className="space-y-3 bg-gray-100 rounded min-h-149"
            aria-busy="true"
            aria-label="Rechnungen werden geladen"
          >
            {SKELETON_KEYS.map((key) => (
              <InvoicesSkeleton key={key} />
            ))}
          </ul>
        ) : query.error ? (
          <p className="text-red-600">Fehler beim Laden</p>
        ) : invoices.length === 0 ? (
          <p className="text-gray-600">Keine Rechnungen gefunden</p>
        ) : (
          <ul className="space-y-3 bg-gray-100 rounded min-h-149">
            {invoices.map((inv: Invoice) => {
              return (
                <li
                  key={inv.id}
                  className="flex items-center justify-between border p-3 rounded bg-white"
                >
                  <div>
                    <p className="font-medium">
                      <span>{inv.invoiceNumber}</span>
                      <span> / </span>
                      <span>{inv.customerNumber}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      {inv.customerName} –{" "}
                      {new Date(inv.createdAt).toLocaleDateString("de-DE")}
                    </p>
                    <p className="text-sm font-semibold">
                      Gesamt:{" "}
                      {inv.items
                        .map((it) => it.quantity * it.unitPrice)
                        .reduce((a, b) => a + b, 0)
                        .toFixed(2)}{" "}
                      €
                    </p>
                    {inv.isPaid ? (
                      <p className="text-green-600 text-sm font-semibold">
                        <span className="flex items-center">
                          <SquareCheckBig className="w-4 h-4 mr-2" /> Bezahlt
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm font-semibold">
                        {inv.overduePaymentLevel &&
                        inv.overduePaymentLevel > 0 ? (
                          <span
                            title={`für ${MAHNUNG_OPTIONS[inv.overduePaymentLevel].title} qualifiziert`}
                            className={`${MAHNUNG_OPTIONS[inv.overduePaymentLevel].color} flex items-center`}
                          >
                            <BellRing className="w-4 h-4 mr-2" />
                            <span>Zahlung überfällig</span>
                          </span>
                        ) : (
                          <span className="flex items-center text-sm text-gray-600">
                            <Square className="w-4 h-4 mr-2" /> Offen
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <ActionMenu
                    invoiceId={inv.id}
                    options={getInvoiceActions({
                      inv,
                      downloadInvoice,
                      downloadReminder,
                      setEmailModalConfig,
                      togglePaid,
                      canSendEmail: inv.deliveryMethod === "EMAIL",
                    })}
                  />
                </li>
              );
            })}
          </ul>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
      <PdfLoadingModal isLoading={invoiceLoading || reminderLoading} />
      {emailModalConfig && (
        <SendEmailModal
          invoice={emailModalConfig.invoice}
          type={emailModalConfig.type}
          level={emailModalConfig.level as 1 | 2 | 3}
          isOpen={!!emailModalConfig}
          onClose={() => handleCloseSendEmailModal(emailModalConfig.invoice.id)}
        />
      )}
    </>
  );
}
