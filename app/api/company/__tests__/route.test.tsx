import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  findMembership: vi.fn(),
  findCompany: vi.fn(),
  updateCompany: vi.fn(),
  createSnapshot: vi.fn(),
  logActivity: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers(),
}));

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}));

vi.mock("@/lib/activity-log", () => ({ logActivity: mocks.logActivity }));

vi.mock("@/lib/prisma-client", () => ({
  prisma: {
    $transaction: mocks.transaction,
    organizationMember: { findFirst: mocks.findMembership },
    company: {
      findUniqueOrThrow: mocks.findCompany,
      update: mocks.updateCompany,
    },
    companySnapshot: { create: mocks.createSnapshot },
  },
}));

const { PATCH, POST } = await import("../route");

const storedCompany = {
  id: "company-1",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  name: "Test GmbH",
  street: "Hauptstr.",
  houseNumber: "1",
  zipCode: "12345",
  city: "Köln",
  country: "Deutschland",
  phone: "+491701234567",
  email: "a@b.de",
  iban: "DE89 3704 0044 0532 0130 00",
  bic: "COBADEFFXXX",
  bank: "Commerzbank",
  logoUrl: null,
  isSubjectToVAT: true,
  firstTaxRate: 19,
  secondTaxRate: 7,
  legalForm: "GMBH",
  steuernummer: null,
  ustId: "DE123456789",
  handelsregisternummer: "HRB 12345",
  lastInvoiceNumber: 3,
  lastCustomerNumber: 2,
};

const request = (method: string, body: unknown) =>
  new Request("http://localhost/api/company", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const patch = (body: unknown) => PATCH(request("PATCH", body));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSession.mockResolvedValue({ user: { id: "user-1" } });
  mocks.findMembership.mockResolvedValue({
    role: "admin",
    organization: { id: "org-1", companyId: "company-1" },
  });
  mocks.findCompany.mockResolvedValue(storedCompany);
  mocks.updateCompany.mockImplementation(
    async ({ data }: { data: Record<string, unknown> }) => ({
      ...storedCompany,
      ...data,
    }),
  );
  mocks.createSnapshot.mockResolvedValue({ id: "snapshot-1" });
});

describe("PATCH /api/company", () => {
  it("drops fields that are not part of the company payload", async () => {
    const response = await patch({
      name: "Neu GmbH",
      id: "hijacked",
      lastInvoiceNumber: 999,
      lastCustomerNumber: 999,
    });

    expect(response.status).toBe(200);
    expect(mocks.updateCompany).toHaveBeenCalledWith({
      where: { id: "company-1" },
      data: { name: "Neu GmbH" },
    });
  });

  it("rejects a tax rate the database could not store", async () => {
    const response = await patch({ firstTaxRate: 500 });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("Steuersatz");
    expect(mocks.updateCompany).not.toHaveBeenCalled();
  });

  it("rejects a value of the wrong type", async () => {
    const response = await patch({ name: 42 });

    expect(response.status).toBe(400);
    expect(mocks.updateCompany).not.toHaveBeenCalled();
  });

  it("returns the refreshed company with plain numbers", async () => {
    const body = await (await patch({ firstTaxRate: 7 })).json();

    expect(body.firstTaxRate).toBe(7);
    expect(body.lastInvoiceNumber).toBe(3);
  });
});

describe("POST /api/company", () => {
  it("rejects a payload without the required company fields", async () => {
    const response = await POST(request("POST", { name: "Nur ein Name" }));

    expect(response.status).toBe(400);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
