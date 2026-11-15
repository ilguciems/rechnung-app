import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  deleteSessions: vi.fn(),
  deleteVerifications: vi.fn(),
}));

vi.mock("@/lib/prisma-client", () => ({
  prisma: {
    session: { deleteMany: mocks.deleteSessions },
    verification: { deleteMany: mocks.deleteVerifications },
  },
}));

const { POST } = await import("../route");

const post = (authorization?: string) =>
  POST(
    new Request("http://localhost/api/maintenance/cleanup", {
      method: "POST",
      headers: authorization ? { authorization } : undefined,
    }),
  );

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  mocks.deleteSessions.mockResolvedValue({ count: 4 });
  mocks.deleteVerifications.mockResolvedValue({ count: 2 });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/maintenance/cleanup", () => {
  it("stays disabled while CRON_SECRET is not configured", async () => {
    const response = await post("Bearer anything");

    expect(response.status).toBe(503);
    expect(mocks.deleteSessions).not.toHaveBeenCalled();
  });

  it("rejects a wrong or missing token", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");

    expect((await post()).status).toBe(401);
    expect((await post("Bearer wrong")).status).toBe(401);
    expect(mocks.deleteSessions).not.toHaveBeenCalled();
  });

  it("deletes expired sessions and verification tokens", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");

    const startedAt = Date.now();
    const response = await post("Bearer s3cret");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ deleted: { sessions: 4, verifications: 2 } });

    const sessionCutoff = mocks.deleteSessions.mock.calls[0][0].where.expiresAt
      .lt as Date;
    const verificationCutoff = mocks.deleteVerifications.mock.calls[0][0].where
      .expiresAt.lt as Date;
    const day = 24 * 60 * 60 * 1000;

    expect(sessionCutoff.getTime()).toBeGreaterThanOrEqual(
      startedAt - 30 * day,
    );
    expect(sessionCutoff.getTime()).toBeLessThan(startedAt - 29 * day);
    expect(verificationCutoff.getTime()).toBeGreaterThanOrEqual(
      startedAt - 7 * day,
    );
    expect(verificationCutoff.getTime()).toBeLessThan(startedAt - 6 * day);
  });
});
