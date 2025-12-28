import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const TWO_HOURS = 1000 * 60 * 60 * 2;
export const SIX_MINUTES = 1000 * 60 * 6;
export async function POST() {
  const expiresAt = Date.now() + TWO_HOURS;
  (await cookies()).set("timer-expires-at", expiresAt.toString(), {
    httpOnly: true,
    secure: true,
  });
  return NextResponse.json({ success: true });
}
