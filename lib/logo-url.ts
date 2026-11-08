import fs from "node:fs/promises";
import path from "node:path";

/**
 * Users without a company have no row to store a logo URL in, so the newest
 * uploaded file is resolved from disk instead. Every upload gets a timestamped
 * filename, which keeps the URL unique (and cacheable as immutable) without a
 * query string — next/image only accepts configured local paths.
 */
export async function getUserLogoUrl(
  userId: string,
  publicDir: string = path.join(process.cwd(), "public"),
): Promise<string | null> {
  const assetsDir = path.join(publicDir, "assets");
  const legacyName = `logo_${userId}.png`;

  try {
    const entries = await fs.readdir(assetsDir);
    const candidates = entries.filter(
      (name) =>
        name === legacyName ||
        (name.startsWith(`logo_${userId}_`) && name.endsWith(".png")),
    );

    const stats = await Promise.allSettled(
      candidates.map(async (name) => ({
        name,
        mtimeMs: (await fs.stat(path.join(assetsDir, name))).mtimeMs,
      })),
    );

    let newest: string | null = null;
    let newestMtime = -Infinity;

    for (const result of stats) {
      if (result.status === "fulfilled" && result.value.mtimeMs > newestMtime) {
        newestMtime = result.value.mtimeMs;
        newest = result.value.name;
      }
    }

    return newest ? `/api/assets/${newest}` : null;
  } catch {
    return null;
  }
}
