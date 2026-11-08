import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const OLD_LOGO_URL = "/api/assets/logo_company-1_1794147118005.png";
const OLD_FILE_NAME = "logo_company-1_1794147118005.png";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  updateCompany: vi.fn(),
  createSnapshot: vi.fn(),
  countInvoices: vi.fn(),
  logActivity: vi.fn(),
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

vi.mock("@/lib/activity-log", () => ({
  logActivity: mocks.logActivity,
}));

vi.mock("@/lib/prisma-client", () => ({
  prisma: {
    organizationMember: {
      findFirst: async () => ({
        role: "admin",
        organization: {
          id: "organization-1",
          company: { id: "company-1", logoUrl: OLD_LOGO_URL },
        },
      }),
    },
    company: { update: mocks.updateCompany },
    companySnapshot: { create: mocks.createSnapshot },
    invoice: { count: mocks.countInvoices },
  },
}));

const { POST } = await import("../route");

const postLogo = async () => {
  // jsdom's FormData and undici's multipart parser disagree on File instances,
  // so the handler receives the parsed form directly.
  const body = {
    get: () => new File([new Uint8Array([137, 80, 78, 71])], "logo.png"),
  };

  return POST({ formData: async () => body } as unknown as Request);
};

describe("POST /api/company/logo", () => {
  let projectRoot: string;
  let oldFilePath: string;

  beforeEach(async () => {
    projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), "logo-route-"));
    oldFilePath = path.join(projectRoot, "public", "assets", OLD_FILE_NAME);
    await fs.mkdir(path.dirname(oldFilePath), { recursive: true });
    await fs.writeFile(oldFilePath, "png");

    vi.spyOn(process, "cwd").mockReturnValue(projectRoot);
    mocks.getSession.mockResolvedValue({ user: { id: "user-1" } });
    mocks.updateCompany.mockImplementation(
      async ({ data }: { data: { logoUrl: string } }) => ({
        id: "company-1",
        name: "Company",
        street: "Street",
        houseNumber: "1",
        zipCode: "12345",
        city: "City",
        country: "DE",
        phone: "1",
        email: "company@example.com",
        iban: "DE1",
        bic: "BIC",
        bank: "Bank",
        logoUrl: data.logoUrl,
        isSubjectToVAT: false,
        firstTaxRate: null,
        secondTaxRate: null,
        legalForm: "EINZELUNTERNEHMEN",
        steuernummer: null,
        ustId: null,
        handelsregisternummer: null,
      }),
    );
    mocks.createSnapshot.mockResolvedValue({ id: "snapshot-1" });
  });

  afterEach(async () => {
    await fs.rm(projectRoot, { recursive: true, force: true });
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("keeps the previous logo while an invoice prints it", async () => {
    mocks.countInvoices.mockResolvedValue(1);

    const response = await postLogo();

    expect(response.status).toBe(200);
    expect(mocks.countInvoices).toHaveBeenCalledWith({
      where: { companySnapshot: { logoUrl: OLD_LOGO_URL } },
    });
    await expect(fs.access(oldFilePath)).resolves.toBeUndefined();
  });

  it("removes the previous logo once no invoice references it", async () => {
    mocks.countInvoices.mockResolvedValue(0);

    const response = await postLogo();

    expect(response.status).toBe(200);
    await expect(fs.access(oldFilePath)).rejects.toThrow();
  });
});
