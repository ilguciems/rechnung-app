"use client";

import { FileText, Square, SquareCheckBig } from "lucide-react";
import {
  useDownloadInvoicePdf,
  useInvoicesList,
  useToggleInvoicePaid,
} from "@/hooks";
import type { InvoiceItem } from "@/lib/zod-schema";
import {
  ActionMenu,
  DeleteLastInvoiceButton,
  InvoicesSkeleton,
  Pagination,
  PdfLoadingModal,
  SKELETON_KEYS,
} from "./components";

type Invoice = {
  id: number;
  invoiceNumber: string;
  customerName: string;
  total: number;
  createdAt: string;
  items: InvoiceItem[];
  isPaid: boolean;
  customerNumber: string;
};

export default function InvoicesListSection() {
  const { setSearchDebounced, isPaid, setIsPaid, page, setPage, query } =
    useInvoicesList();
  const togglePaid = useToggleInvoicePaid();

  const data = query.data;
  const invoices = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const { downloadPDF, loading: pdfLoading } = useDownloadInvoicePdf();

  const handlePaidFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsPaid(e.target.value);
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
            {invoices.map((inv: Invoice) => (
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
                    <p className="text-green-600 font-semibold text-sm">
                      ✔ Bezahlt
                    </p>
                  ) : (
                    <p className="text-red-600 font-semibold text-sm">
                      ❌ Offen
                    </p>
                  )}
                </div>
                <ActionMenu
                  options={[
                    {
                      id: `${inv.id}-toggle`,
                      text: inv.isPaid ? "Offen setzen" : "Bezahlt setzen",
                      node: (
                        <span className="flex items-center">
                          {inv.isPaid ? (
                            <>
                              <span aria-hidden="true">
                                <Square className="w-4 h-4 mr-2" />
                              </span>{" "}
                              <span>Offen setzen</span>
                            </>
                          ) : (
                            <>
                              <span aria-hidden="true">
                                <SquareCheckBig className="w-4 h-4 mr-2" />
                              </span>{" "}
                              <span>Bezahlt setzen</span>
                            </>
                          )}
                        </span>
                      ),
                      onClick: () =>
                        togglePaid.mutate({ id: inv.id, current: inv.isPaid }),
                    },
                    {
                      id: `${inv.id}-download`,
                      text: "PDF herunterladen",
                      node: (
                        <span className="flex items-center">
                          <span aria-hidden="true">
                            <FileText className="w-4 h-4 mr-2" />
                          </span>
                          <span>PDF herunterladen</span>
                        </span>
                      ),
                      onClick: () => downloadPDF(inv.id),
                    },
                  ]}
                />
              </li>
            ))}
          </ul>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
      <PdfLoadingModal isLoading={pdfLoading} />
    </>
  );
}
