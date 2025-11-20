"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import _ from "lodash";
import { FileText, Square, SquareCheckBig } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { ROUTES } from "@/lib/api-routes";
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

const PER_PAGE = 5;

export default function InvoicesListSection() {
  const [search, setSearch] = useState("");
  const [isPaid, setIsPaid] = useState<string>(""); // "", "true", "false"
  const [page, setPage] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(false);

  const queryClient = useQueryClient();

  // Debounce for search
  const debouncedSearch = useMemo(
    () =>
      _.debounce((val: string) => {
        setSearch(val);
      }, 500),
    [],
  );

  useEffect(() => {
    const filterApplied =
      (search && search.trim() !== "") ||
      isPaid === "true" ||
      isPaid === "false" ||
      isPaid === "";

    if (filterApplied) {
      setPage(1);
    }
  }, [search, isPaid]);

  // load invoices
  const { data, isLoading, error } = useQuery({
    queryKey: ["invoices", search, isPaid, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (isPaid) params.set("isPaid", isPaid);
      params.set("page", String(page));
      params.set("pageSize", PER_PAGE.toString());

      const res = await fetch(ROUTES.INVOICES_SEARCH(params));

      if (!res.ok) throw new Error("Fehler beim Laden");
      return res.json();
    },
  });

  const invoices = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

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
      toast.success("Status aktualisiert!");
    },
    onError: () => {
      toast.error("Fehler beim Aktualisieren");
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
    const val = e.target.value;
    setPage(1);
    debouncedSearch(val);
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
            placeholder="Suche nach Kunde, Kunden-Nr. oder Rechnungs-Nr..."
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
        {isLoading ? (
          <ul
            className="space-y-3 bg-gray-100 rounded min-h-149"
            aria-busy="true"
            aria-label="Rechnungen werden geladen"
          >
            {SKELETON_KEYS.map((key) => (
              <InvoicesSkeleton key={key} />
            ))}
          </ul>
        ) : error ? (
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
