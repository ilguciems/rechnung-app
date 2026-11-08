import fs from "node:fs/promises";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
};

/**
 * Route params arrive URL-decoded, so `..%2F..%2F.env` reaches this function as
 * `../../.env`. Only a bare file name with an allowed extension inside
 * `public/assets` is served; everything else is treated as not found.
 */
function resolveAsset(filename: string) {
  if (
    !filename ||
    filename === "." ||
    filename === ".." ||
    filename.includes("/") ||
    filename.includes("\\") ||
    filename.includes("\0")
  ) {
    return null;
  }

  const contentType = CONTENT_TYPES[path.extname(filename).toLowerCase()];

  if (!contentType) {
    return null;
  }

  const assetsDir = path.resolve(process.cwd(), "public", "assets");
  const filePath = path.resolve(assetsDir, filename);
  const relativePath = path.relative(assetsDir, filePath);

  if (
    !relativePath ||
    relativePath.startsWith("..") ||
    path.isAbsolute(relativePath)
  ) {
    return null;
  }

  return { filePath, contentType };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const asset = resolveAsset(filename);

  if (!asset) {
    return new NextResponse("File not found", { status: 404 });
  }

  try {
    const fileBuffer = await fs.readFile(asset.filePath);

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": asset.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("File not found", { status: 404 });
  }
}
