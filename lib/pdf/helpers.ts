import { type PDFFont, type PDFPage, rgb } from "pdf-lib";
import { formatPhone } from "@/lib/phone-utils";
import type { Company } from "@/lib/zod-schema";

export const NAMED_REQUIRED_FORMS = [
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

export const LEGAL_FORM_VALUES = {
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

// helper: measure wrapped height for description column without drawing
export function measureWrappedHeight(
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
export function drawWrappedText(
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
export function drawTableHeader(
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

// footer helper (kept simple; tweak as you like)
export function drawFooter(
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
