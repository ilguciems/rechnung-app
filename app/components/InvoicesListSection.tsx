"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import _ from "lodash";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { ROUTES } from "@/lib/api-routes";
import type { InvoiceItem } from "@/lib/zod-schema";
import DeleteLastInvoiceButton from "./DeleteLastInvoiceButton";
import PdfLoadingModal from "./PdfLoadingModal";

type Invoice = {
  id: number;
  invoiceNumber: string;
  customerName: string;
  total: number;
  createdAt: string;
  items: InvoiceItem[];
  isPaid: boolean;
};

export default function InvoicesListSection() {
  const [search, setSearch] = useState("");
  const [isPaid, setIsPaid] = useState<string>(""); // "", "true", "false"
  const [pdfLoading, setPdfLoading] = useState(false);

  const queryClient = useQueryClient();

  // Debounce for search
  const debouncedSetSearch = useMemo(
    () => _.debounce((val: string) => setSearch(val), 500),
    [],
  );

  // load invoices
  const {
    data: invoices = [],
    isLoading,
    error,
  } = useQuery<Invoice[]>({
    queryKey: ["invoices", search, isPaid],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (isPaid) params.set("isPaid", isPaid);

      const res = await fetch(ROUTES.INVOICES_SEARCH(params));
      if (!res.ok) throw new Error("Fehler beim Laden");
      return res.json();
    },
  });

  // Change paid status
  const togglePaid = useMutation({
    mutationFn: async ({ id, current }: { id: number; current: boolean }) => {
      const res = await fetch(ROUTES.INVOICE(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid: !current }),
      });
      if (!res.ok) throw new Error("Fehler beim Aktualisieren");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  // PDF download
  const downloadPDF = async (id: number) => {
    try {
      setPdfLoading(true);
      const res = await fetch(ROUTES.INVOICE_PDF(id));
      if (!res.ok) {
        toast.error("Fehler beim PDF-Export");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Fehler beim PDF-Export");
    } finally {
      setPdfLoading(false);
    }
  };

  // Handlers

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearch(e.target.value);
  };

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
            placeholder="Suche nach Kunde oder Rechnungsnummer..."
            onChange={handleSearch}
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
        {isLoading && <p>Lade Rechnungen...</p>}
        {error && <p className="text-red-600">Fehler beim Laden</p>}
        {!isLoading && !error && invoices.length === 0 && (
          <p className="text-gray-600">Keine Rechnungen gefunden</p>
        )}
        <ul className="space-y-3">
          {invoices.map((inv) => (
            <li
              key={inv.id}
              className="flex items-center justify-between border p-3 rounded"
            >
              <div>
                <p className="font-medium">{inv.invoiceNumber}</p>
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
                  <p className="text-red-600 font-semibold text-sm">❌ Offen</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                <button
                  type="button"
                  onClick={() =>
                    togglePaid.mutate({ id: inv.id, current: inv.isPaid })
                  }
                  className={`px-3 py-1 rounded disabled:opacity-50 ${
                    inv.isPaid
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white cursor-pointer`}
                  disabled={togglePaid.isPending}
                >
                  {inv.isPaid ? "Offen setzen" : "Bezahlt setzen"}
                </button>
                <button
                  type="button"
                  onClick={() => downloadPDF(inv.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-blue-700"
                >
                  PDF herunterladen
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {pdfLoading && <PdfLoadingModal />}
    </>
  );
}
