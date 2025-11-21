"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ROUTES } from "@/lib/api-routes";

export function useDownloadInvoicePdf() {
  const [loading, setLoading] = useState(false);

  const downloadPDF = async (id: number) => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  return { downloadPDF, loading };
}
