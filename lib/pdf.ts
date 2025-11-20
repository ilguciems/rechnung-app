import fs from "fs";
import path from "path";
import {
  PDFDocument,
  type PDFFont,
  type PDFPage,
  rgb,
  StandardFonts,
} from "pdf-lib";
import { formatPhone } from "@/lib/phone-utils";
import type { Company, Invoice } from "@/lib/zod-schema";

interface CreatedInvoice extends Invoice {
  invoiceNumber: string;
  customerNumber: string;
  createdAt: Date;
  isPaid: boolean;
  paidAt: Date | null;
}

const NAMED_REQUIRED_FORMS = [
  "GBR",
  "GMBH",
  "UG",
  "AG",
  "OHG",
  "KG",
  "GMBH_CO_KG",
  "KGaA",
  "SE",
  "EWIV",
];

const LEGAL_FORM_VALUES = {
  KLEINGEWERBE: "Kleingewerbe",
  FREIBERUFLER: "Freiberufler",
  GBR: "GbR",
  EINZELKAUFMANN: "Einzelkaufmann",
  OHG: "OhG",
  KG: "KG",
  GMBH_CO_KG: "Gmbh & Co. KG",
  GMBH: "GmbH",
  UG: "UG",
  AG: "AG",
  KGaA: "KGaA",
  SE: "SE",
  EWIV: "EWIV",
};

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

  // helper: measure wrapped height for description column without drawing
  function measureWrappedHeight(
    text: string,
    maxWidth: number,
    fontObj: PDFFont,
    fontSize: number,
    lineGap = 2,
  ): number {
    if (!text) return fontSize;
    const words = text.split(" ");
    let line = "";
    let lines = 0;
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = line ? `${line} ${word}` : word;
      const testWidth = fontObj.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > maxWidth && line !== "") {
        lines++;
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line.trim() !== "") lines++;
    const lineHeight = fontSize + lineGap;
    return lines * lineHeight;
  }

  // helper: draw wrapped text and return drawn height
  function drawWrappedText(
    pg: PDFPage,
    text: string,
    x: number,
    yTop: number,
    maxWidth: number,
    fontObj: PDFFont,
    fontSize: number,
    lineGap = 2,
  ): number {
    if (!text) {
      pg.drawText("", { x, y: yTop, size: fontSize, font: fontObj });
      return fontSize;
    }
    const words = text.split(" ");
    let line = "";
    let offsetLines = 0;
    const lineHeight = fontSize + lineGap;
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = line ? `${line} ${word}` : word;
      const testWidth = fontObj.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > maxWidth && line !== "") {
        pg.drawText(line.trim(), {
          x,
          y: yTop - offsetLines * lineHeight,
          size: fontSize,
          font: fontObj,
        });
        offsetLines++;
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line.trim() !== "") {
      pg.drawText(line.trim(), {
        x,
        y: yTop - offsetLines * lineHeight,
        size: fontSize,
        font: fontObj,
      });
      offsetLines++;
    }
    return offsetLines * lineHeight;
  }

  // helper: draw table header and return new y (after header)
  function drawTableHeader(
    pg: PDFPage,
    yTop: number,
    headers: string[],
    colWidths: number[],
    startX: number,
    tableWidth: number,
    _fontObj: PDFFont,
    boldObj: PDFFont,
  ): number {
    let xPos = startX;
    const headerFontSize = 12;
    for (let i = 0; i < headers.length; i++) {
      pg.drawText(headers[i], {
        x: xPos,
        y: yTop,
        size: headerFontSize,
        font: boldObj,
      });
      xPos += colWidths[i];
    }
    // thin line under header
    pg.drawLine({
      start: { x: startX, y: yTop - 6 },
      end: { x: startX + tableWidth, y: yTop - 6 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    return yTop - 20; // move cursor down after header
  }

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

// footer helper (kept simple; tweak as you like)
function drawFooter(
  page: PDFPage,
  company: Company,
  footerY: number,
  font: PDFFont,
  boldFont: PDFFont,
) {
  const { width } = page.getSize();
  const leftX = 30;
  const centerX = width / 3 + 40;
  const rightX = (width / 3) * 2;

  const showLegalForm =
    company.legalForm && NAMED_REQUIRED_FORMS.includes(company.legalForm);

  const companyName = showLegalForm
    ? `${company.name} ${LEGAL_FORM_VALUES[company.legalForm]}`
    : company.name;

  page.drawText(companyName, {
    x: leftX,
    y: footerY + 30,
    size: 9,
    font: boldFont,
  });
  page.drawText(`${company.street} ${company.houseNumber}`, {
    x: leftX,
    y: footerY + 15,
    size: 9,
    font,
  });
  page.drawText(
    `${company.zipCode} ${company.city}${
      company.country !== "Deutschland" ? `, ${company.country}` : ""
    }`,
    { x: leftX, y: footerY, size: 9, font },
  );

  let contactY = footerY + 30;
  if (company.phone) {
    page.drawText(`Tel: ${formatPhone(company.phone)}`, {
      x: centerX,
      y: contactY,
      size: 9,
      font,
    });
    contactY -= 15;
  }
  if (company.email) {
    page.drawText(`E-Mail: ${company.email}`, {
      x: centerX,
      y: contactY,
      size: 9,
      font,
    });
    contactY -= 15;
  }
  if (company.steuernummer || company.ustId) {
    const taxText = company.ustId
      ? `USt-IdNr: ${company.ustId}`
      : `Steuernummer: ${company.steuernummer}`;
    page.drawText(taxText, { x: centerX, y: contactY, size: 9, font });
    contactY -= 15;
  }
  if (company.handelsregisternummer) {
    page.drawText(`HrNr: ${company.handelsregisternummer}`, {
      x: centerX,
      y: contactY,
      size: 9,
      font,
    });
  }

  if (company.bank && company.iban && company.bic) {
    page.drawText(`${company.bank}`, {
      x: rightX,
      y: footerY + 30,
      size: 9,
      font,
    });
    page.drawText(`IBAN: ${company.iban}`, {
      x: rightX,
      y: footerY + 15,
      size: 9,
      font,
    });
    page.drawText(`BIC: ${company.bic}`, {
      x: rightX,
      y: footerY,
      size: 9,
      font,
    });
  }
}
