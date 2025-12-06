import fs from "fs";
import path from "path";
import { PDFDocument, type PDFPage, rgb, StandardFonts } from "pdf-lib";
import type { Company, Invoice } from "@/lib/zod-schema";
import {
  drawFooter,
  drawTableHeader,
  drawWrappedText,
  LEGAL_FORM_VALUES,
  measureWrappedHeight,
  NAMED_REQUIRED_FORMS,
} from "./helpers";

interface CreatedInvoice extends Invoice {
  invoiceNumber: string;
  customerNumber: string | null;
  createdAt: Date;
  isPaid: boolean;
  paidAt: Date | null;
}

const PAGE_WIDTH = 600;
const PAGE_HEIGHT = 800;
const TOP_MARGIN = 60;
const FOOTER_Y = 40;
const BOTTOM_MARGIN = FOOTER_Y + 60;

export async function generateInvoicePDF(
  invoice: CreatedInvoice,
  company: Company,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pages: Array<PDFPage> = [];
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  pages.push(page);

  let y = PAGE_HEIGHT - TOP_MARGIN;

  // helper: add new page and reset y, also push to pages[]
  const addNewPage = () => {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pages.push(page);
    y = PAGE_HEIGHT - TOP_MARGIN;
  };

  // ---------------------------
  // Start drawing content (first page)
  // ---------------------------

  // logo (if exists)
  const logoPath = path.join(process.cwd(), "public", "assets/logo.png");
  if (fs.existsSync(logoPath)) {
    const logoImageBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoImageBytes);
    const logoDims = logoImage.scale(0.25);
    page.drawImage(logoImage, {
      x: 50,
      y: y - logoDims.height + 20,
      width: logoDims.width,
      height: logoDims.height,
    });
  }

  // top: invoice number and date
  page.drawText(`Rechnungs-Nr. ${invoice.invoiceNumber}`, {
    x: 400,
    y,
    size: 9,
    font,
  });
  y -= 15;
  page.drawText(
    `Rechnungsdatum: ${new Date(invoice.createdAt).toLocaleDateString(
      "de-DE",
    )}`,
    { x: 400, y, size: 9, font },
  );
  if (invoice.customerNumber) {
    y -= 15;
    page.drawText(`Kunden-Nr.: ${invoice.customerNumber}`, {
      x: 400,
      y,
      size: 9,
      font,
    });
  }
  if (invoice.isPaid && invoice.paidAt) {
    y -= 15;
    page.drawText(
      `Bezahlt am: ${new Date(invoice.paidAt).toLocaleDateString("de-DE")}`,
      { x: 400, y, size: 9, font },
    );
  }

  const showLegalForm =
    company.legalForm && NAMED_REQUIRED_FORMS.includes(company.legalForm);

  const companyName = showLegalForm
    ? `${company.name} ${LEGAL_FORM_VALUES[company.legalForm]}`
    : company.name;

  // top: small company address and invoice address
  y -= 40;
  const companyAddress = `${companyName}, ${company.street} ${
    company.houseNumber
  }, ${company.zipCode} ${company.city} ${
    company.country === "Deutschland" ? "" : `, ${company.country}`
  }`;
  y -= 40;
  page.drawText(companyAddress, { x: 50, y, size: 7, font });
  y -= 15;
  page.drawText(invoice.customerName, { x: 50, y, size: 12, font });
  y -= 15;
  page.drawText(`${invoice.customerStreet} ${invoice.customerHouseNumber}`, {
    x: 50,
    y,
    size: 12,
    font,
  });
  y -= 15;
  page.drawText(`${invoice.customerZipCode} ${invoice.customerCity}`, {
    x: 50,
    y,
    size: 12,
    font,
  });
  y -= 15;
  if (invoice.customerCountry !== "Deutschland") {
    page.drawText(invoice.customerCountry, { x: 50, y, size: 12, font });
  }

  y -= 70;

  // invoice title
  page.drawText(`Rechnung Nr. ${invoice.invoiceNumber}`, {
    x: 50,
    y,
    size: 14,
    font: boldFont,
  });

  // metadata
  y -= 30;
  const paymentText = invoice.isPaid
    ? "Rechnung ist bereits vollständig bezahlt."
    : "Zahlungsziel: 14 Tage ab Rechnungsdatum";
  page.drawText(paymentText, { x: 50, y, size: 12, font });

  // ===================
  // Table headers
  // ===================
  y -= 30;
  const startX = 50;
  const tableWidth = 500;
  const baseRowHeight = 20;

  const headers = company.isSubjectToVAT
    ? ["Pos.", "Beschreibung", "Menge", "Einzelpreis", "MwSt.", "Gesamt"]
    : ["Pos.", "Beschreibung", "Menge", "Einzelpreis", "Gesamt"];

  const colWidths = company.isSubjectToVAT
    ? [40, 160, 60, 80, 60, 80]
    : [40, 180, 60, 100, 100];

  // draw header on the current page
  y = drawTableHeader(
    page,
    y,
    headers,
    colWidths,
    startX,
    tableWidth,
    font,
    boldFont,
  );

  // totals helpers
  let netTotal = 0;
  const vatTotals: Record<number, number> = {};

  // ===================
  // draw items (with pagination)
  // ===================
  for (let i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    // estimate required height for description column
    const descMaxWidth = colWidths[1] - 6;
    const descHeight = measureWrappedHeight(
      String(item.description || ""),
      descMaxWidth,
      font,
      11,
    );
    const rowHeightNeeded = Math.max(baseRowHeight, descHeight + 4);

    // if not enough space -> add new page and draw header there
    if (y - rowHeightNeeded < BOTTOM_MARGIN) {
      addNewPage();
      // draw table header on new page
      y = drawTableHeader(
        page,
        y,
        headers,
        colWidths,
        startX,
        tableWidth,
        font,
        boldFont,
      );
    }

    // now actually draw the row on current `page`
    let xPos = startX;
    const itemTaxRate = item.taxRate ?? 0;
    const netUnitPrice = item.unitPrice / (1 + itemTaxRate / 100);
    const itemNet = item.quantity * netUnitPrice;
    const vatRate = item.taxRate ?? 0;
    const vatAmount = (itemNet * vatRate) / 100;
    const itemTotal = item.quantity * item.unitPrice;

    netTotal += itemNet;
    if (company.isSubjectToVAT && vatRate > 0) {
      vatTotals[vatRate] = (vatTotals[vatRate] || 0) + vatAmount;
    }

    const columns = company.isSubjectToVAT
      ? [
          String(i + 1),
          String(item.description ?? ""),
          String(item.quantity),
          `${item.unitPrice.toFixed(2)} €`,
          `${vatRate}%`,
          `${itemTotal.toFixed(2)} €`,
        ]
      : [
          String(i + 1),
          String(item.description ?? ""),
          String(item.quantity),
          `${item.unitPrice.toFixed(2)} €`,
          `${itemTotal.toFixed(2)} €`,
        ];

    // draw each column; for description use wrapped drawer
    let usedRowHeight = baseRowHeight;
    for (let j = 0; j < columns.length; j++) {
      if (j === 1) {
        // description column
        const drawnH = drawWrappedText(
          page,
          columns[j],
          xPos,
          y,
          colWidths[j] - 6,
          font,
          11,
        );
        usedRowHeight = Math.max(usedRowHeight, drawnH + 4);
      } else {
        page.drawText(columns[j], { x: xPos, y, size: 11, font });
      }
      xPos += colWidths[j];
    }

    // move cursor
    y -= usedRowHeight;
  }

  // ===================
  // totals area (ensure fits)
  // ===================
  if (y - 120 < BOTTOM_MARGIN) {
    addNewPage();
    y = drawTableHeader(
      page,
      y,
      headers,
      colWidths,
      startX,
      tableWidth,
      font,
      boldFont,
    );
  }

  y -= 20;
  if (company.isSubjectToVAT) {
    const totalVAT = Object.values(vatTotals).reduce((a, b) => a + b, 0);
    const grandTotal = netTotal + totalVAT;

    page.drawText(`Zwischensumme (Netto): ${netTotal.toFixed(2)} €`, {
      x: 350,
      y,
      size: 12,
      font,
    });
    y -= 15;
    for (const [rateStr, vatSum] of Object.entries(vatTotals)) {
      page.drawText(`MwSt. ${rateStr}%: ${vatSum.toFixed(2)} €`, {
        x: 350,
        y,
        size: 12,
        font,
      });
      y -= 15;
    }
    page.drawText(`Gesamtbetrag (Brutto): ${grandTotal.toFixed(2)} €`, {
      x: 350,
      y,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0.8),
    });
  } else {
    page.drawText(`Gesamt: ${netTotal.toFixed(2)} €`, {
      x: 400,
      y,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0.8),
    });
    y -= 30;
    page.drawText(
      "Hinweis: Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.",
      { x: 50, y, size: 11, font },
    );
  }

  // final thank you
  y -= 30;
  page.drawText("Vielen Dank für Ihren Auftrag!", {
    x: 50,
    y,
    size: 12,
    font: boldFont,
  });

  // ---------------------------
  // draw footers and page numbers on ALL pages
  // ---------------------------
  const totalPages = pages.length;
  pages.forEach((p, idx) => {
    drawFooter(p, company, FOOTER_Y, font, boldFont);
    p.drawText(`Seite ${idx + 1} / ${totalPages}`, {
      x: PAGE_WIDTH - 60,
      y: FOOTER_Y - 20,
      size: 9,
      font,
    });
  });

  const pdfBytes = await pdfDoc.save();
  return new Uint8Array(pdfBytes);
}
