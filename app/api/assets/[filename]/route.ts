import fs from "node:fs/promises";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  const filePath = path.join(process.cwd(), "public", "assets", filename);

  try {
    const fileBuffer = await fs.readFile(filePath);

    const ext = path.extname(filename).toLowerCase();
    const contentTypes: Record<string, string> = {
      ".png": "image/png",
    };

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentTypes[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (_e) {
    return new NextResponse("File not found", { status: 404 });
  }
}
