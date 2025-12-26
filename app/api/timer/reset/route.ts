import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const expiresAt = Date.now() + 1000 * 60 * 6; // + 1000 * 60 * 60 * 2; // +2 часа
  (await cookies()).set("timer-expires-at", expiresAt.toString(), {
    httpOnly: true,
    secure: true,
  });
  return NextResponse.json({ success: true });
}
//+ 1000 * 60 * 6;
