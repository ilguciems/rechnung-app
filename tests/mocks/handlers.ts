import { HttpResponse, http } from "msw";
import { ROUTES } from "@/lib/api-routes";
import type { Company } from "@/lib/zod-schema";

export const togglePaidSpy = vi.fn();

const customers = [
  {
    id: 1,
    customerName: "Peter Fischer",
    customerStreet: "Fischerstraße",
    customerHouseNumber: "10",
    customerZipCode: "98765",
    customerCity: "Vienna",
    customerCountry: "Österreich",
    customerNumber: "KND-123",
  },
  {
    id: 2,
    customerName: "Petra Fischmann",
    customerStreet: "Schmidtstraße",
    customerHouseNumber: "20",
    customerZipCode: "54321",
    customerCity: "Hamburg",
    customerCountry: "Deutschland",
    customerNumber: "KND-124",
  },
];

const products = [
  {
    id: 1,
    description: "Hardware",
    unitPrice: 100,
    taxRate: 7,
  },
  {
    id: 2,
    description: "Software",
    unitPrice: 50,
    taxRate: 19,
  },
];

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

const invoicePayload = {
  data: [
    {
      id: 1,
      invoiceNumber: "INV-123",
      customerNumber: "KND-123",
      customerName: "John Doe",
      createdAt: "2022-01-01T00:00:00.000Z",
      isPaid: false,
      items: [{ quantity: 1, unitPrice: 100 }],
    },
  ],
  page: 1,
  pageSize: 5,
  total: 1,
  totalPages: 1,
};

export const handlers = [
  http.get(ROUTES.COMPANY, () => {
    return HttpResponse.json(companyPayload);
  }),

  http.post(ROUTES.COMPANY, () => HttpResponse.json(companyPayload)),

  http.patch(ROUTES.COMPANY, async ({ request }) => {
    const body = (await request.json()) as Company;
    return HttpResponse.json({ ...body, id: 1 });
  }),

  // === Autocomplete for customers ===
  http.get("/api/customers/search", ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const q = url.searchParams.get("search")?.toLowerCase() ?? "";

    // Missing type
    if (!type) {
      return HttpResponse.json(
        { error: "Missing search type" },
        { status: 400 },
      );
    }

    // Customers
    if (type === "customers") {
      const filtered = q
        ? customers.filter((c) => c.customerName.toLowerCase().includes(q))
        : customers;

      return HttpResponse.json(filtered.slice(0, 10));
    }

    // Products
    if (type === "products") {
      const filtered = q
        ? products.filter((p) => p.description.toLowerCase().includes(q))
        : products;

      return HttpResponse.json(filtered.slice(0, 10));
    }

    return HttpResponse.json({ error: "Invalid search type" }, { status: 400 });
  }),

  http.get(/\/api\/invoices.*/, () => {
    return HttpResponse.json(invoicePayload);
  }),

  http.get(ROUTES.INVOICE_PDF(1), () => HttpResponse.text("PDF-BINARY-DUMMY")),

  http.post(ROUTES.INVOICES, () => HttpResponse.json({ id: 1 })),

  http.patch("/api/invoices/:id", async ({ request, params }) => {
    const { id } = params;
    togglePaidSpy({ id: Number(id), request: request.clone() });

    return HttpResponse.json({ id: Number(id), isPaid: true }, { status: 200 });
  }),

  http.all(/\/api\/.*/, ({ request }) => {
    console.warn("Unhandled request:", request.url);
    return HttpResponse.json(
      { error: "Unhandled MSW request" },
      { status: 500 },
    );
  }),
];
