import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete("timer-expires-at");

  return NextResponse.json({ success: true });
}
