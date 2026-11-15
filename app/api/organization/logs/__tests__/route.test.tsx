import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthData: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("@/lib/get-auth-data", () => ({ getAuthData: mocks.getAuthData }));

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}));

vi.mock("@/lib/prisma-client", () => ({
  prisma: { activityLog: { findMany: mocks.findMany } },
}));

const { GET } = await import("../route");

const log = (index: number) => ({
  id: `log-${index}`,
  createdAt: new Date(Date.UTC(2026, 0, 31 - index, 12)),
  action: "CREATE",
  entityType: "INVOICE",
  metadata: null,
  user: { id: "user-1", name: "Ada", email: "ada@example.com" },
});

const rows = (count: number) =>
  Array.from({ length: count }, (_, index) => log(index));

const get = async (query = "") => {
  const response = await GET(
    new Request(`http://localhost/api/organization/logs${query}`),
  );
  return { response, body: await response.json() };
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getAuthData.mockResolvedValue({
    user: { id: "user-1" },
    org: { id: "org-1", role: "admin" },
  });
});

describe("GET /api/organization/logs", () => {
  it("returns the first page and a cursor when more rows exist", async () => {
    mocks.findMany.mockResolvedValue(rows(3));

    const { response, body } = await get("?pageSize=2");

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.nextCursor).toBe(`${rows(3)[1].createdAt.toISOString()}|log-1`);
  });

  it("asks for one row more than the page to detect the end", async () => {
    mocks.findMany.mockResolvedValue(rows(2));

    await get("?pageSize=2");

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: "org-1" },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 3,
      }),
    );
  });

  it("ends the list when the page is not full", async () => {
    mocks.findMany.mockResolvedValue(rows(2));

    const { body } = await get("?pageSize=2");

    expect(body.nextCursor).toBeNull();
  });

  it("continues after the given cursor", async () => {
    mocks.findMany.mockResolvedValue(rows(1));
    const cursorDate = new Date("2026-01-20T12:00:00.000Z");
    const cursor = encodeURIComponent(`${cursorDate.toISOString()}|log-9`);

    await get(`?pageSize=2&cursor=${cursor}`);

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationId: "org-1",
          OR: [
            { createdAt: { lt: cursorDate } },
            { createdAt: cursorDate, id: { lt: "log-9" } },
          ],
        },
      }),
    );
  });

  it("ignores a malformed cursor instead of failing", async () => {
    mocks.findMany.mockResolvedValue(rows(1));

    const { response } = await get("?cursor=nonsense");

    expect(response.status).toBe(200);
    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { organizationId: "org-1" } }),
    );
  });

  it("rejects callers that are not organization admins", async () => {
    mocks.getAuthData.mockResolvedValue({
      org: { id: "org-1", role: "member" },
    });

    const { response } = await get();

    expect(response.status).toBe(401);
    expect(mocks.findMany).not.toHaveBeenCalled();
  });
});
