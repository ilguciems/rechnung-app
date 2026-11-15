import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

const DAY = 24 * 60 * 60 * 1000;
// Sessions are kept after their expiry so a stale cookie cannot resurrect one
// that was just removed, and reset tokens outlive the mail they were sent in.
const SESSION_RETENTION_DAYS = 30;
const VERIFICATION_RETENTION_DAYS = 7;

const isAuthorized = (authorization: string | null, secret: string) => {
  const provided = Buffer.from(authorization ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);

  return (
    provided.length === expected.length && timingSafeEqual(provided, expected)
  );
};

/**
 * Removes expired sessions and verification tokens. Meant to be triggered by a
 * scheduler (cron) with `Authorization: Bearer $CRON_SECRET`; without that
 * variable the endpoint stays disabled.
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "maintenance_disabled" },
      { status: 503 },
    );
  }

  if (!isAuthorized(req.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();

  const [sessions, verifications] = await Promise.all([
    prisma.session.deleteMany({
      where: {
        expiresAt: { lt: new Date(now - SESSION_RETENTION_DAYS * DAY) },
      },
    }),
    prisma.verification.deleteMany({
      where: {
        expiresAt: { lt: new Date(now - VERIFICATION_RETENTION_DAYS * DAY) },
      },
    }),
  ]);

  return NextResponse.json({
    deleted: {
      sessions: sessions.count,
      verifications: verifications.count,
    },
  });
}
