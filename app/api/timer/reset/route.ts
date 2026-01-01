import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const TWO_HOURS = 1000 * 60 * 60 * 2;
export const ONE_HOUR = 1000 * 60 * 60;
export const SEVEN_MINUTES = 1000 * 60 * 7;

export async function POST() {
  const expiresAt = Date.now() + ONE_HOUR;
  (await cookies()).set("timer-expires-at", expiresAt.toString(), {
    httpOnly: true,
    secure: true,
  });
  return NextResponse.json({ success: true });
}
