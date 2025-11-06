import { HttpResponse, http } from "msw";
import { ROUTES } from "@/lib/api-routes";
import type { Company } from "@/lib/zod-schema";

const companyPayload = {
  name: "Test Company",
  legalForm: "GMBH",
  street: "Teststraße",
  houseNumber: "1",
  zipCode: "12345",
  city: "Test City",
  country: "Deutschland",
  phone: "+49123456789",
  email: "OZ2m0@example.com",
  iban: "DE12345678901234567890",
  bic: "BIC123456789",
  vatId: "DE123456789",
  isSubjectToVAT: true,
  firstTaxRate: 19,
  secondTaxRate: 7,
};

const invoicePayload = [
  {
    id: 1,
    invoiceNumber: "INV-123",
    customerName: "John Doe",
    createdAt: "2022-01-01T00:00:00.000Z",
    isPaid: false,
    items: [{ quantity: 1, unitPrice: 100 }],
  },
];

export const handlers = [
  http.get(ROUTES.COMPANY, () => {
    return HttpResponse.json(companyPayload);
  }),

  http.post(ROUTES.COMPANY, () => HttpResponse.json(companyPayload)),

  http.patch(ROUTES.COMPANY, async ({ request }) => {
    const body = (await request.json()) as Company;
    return HttpResponse.json({ ...body, id: 1 });
  }),

  http.get(/\/api\/invoices.*/, () => {
    return HttpResponse.json(invoicePayload);
  }),

  http.get(ROUTES.INVOICE_PDF(1), () => HttpResponse.text("PDF-BINARY-DUMMY")),

  http.patch(ROUTES.INVOICE(1), () => HttpResponse.json({})),

  http.post(ROUTES.INVOICES, () => HttpResponse.json({ id: 1 })),

  http.all(/\/api\/.*/, ({ request }) => {
    console.warn("Unhandled request:", request.url);
    return HttpResponse.json(
      { error: "Unhandled MSW request" },
      { status: 500 },
    );
  }),
];
