import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { deleteLogoFile, getUserLogoUrl } from "../logo-url";

const writeLogo = async (publicDir: string, fileName: string) => {
  const filePath = path.join(publicDir, "assets", fileName);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, "png");
  return filePath;
};

describe("getUserLogoUrl", () => {
  let publicDir: string;

  beforeEach(async () => {
    publicDir = await fs.mkdtemp(path.join(os.tmpdir(), "logo-url-"));
  });

  afterEach(async () => {
    await fs.rm(publicDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("returns null when the user has no logo file", async () => {
    expect(await getUserLogoUrl("user-1", publicDir)).toBeNull();
  });

  it("resolves the timestamped filename of an upload", async () => {
    await writeLogo(publicDir, "logo_user-1_1794147118005.png");

    expect(await getUserLogoUrl("user-1", publicDir)).toBe(
      "/api/assets/logo_user-1_1794147118005.png",
    );
  });

  it("still resolves logos uploaded under the legacy stable name", async () => {
    await writeLogo(publicDir, "logo_user-1.png");

    expect(await getUserLogoUrl("user-1", publicDir)).toBe(
      "/api/assets/logo_user-1.png",
    );
  });

  it("returns a different URL after a newer upload", async () => {
    await writeLogo(publicDir, "logo_user-1_1794147118005.png");
    const before = await getUserLogoUrl("user-1", publicDir);

    await new Promise((resolve) => setTimeout(resolve, 10));
    await writeLogo(publicDir, "logo_user-1_1794147199001.png");
    const after = await getUserLogoUrl("user-1", publicDir);

    expect(after).not.toBe(before);
    expect(after).toBe("/api/assets/logo_user-1_1794147199001.png");
  });

  it("ignores logos belonging to other users", async () => {
    await writeLogo(publicDir, "logo_user-100_1794147118005.png");

    expect(await getUserLogoUrl("user-1", publicDir)).toBeNull();
  });
});

describe("deleteLogoFile", () => {
  let publicDir: string;

  beforeEach(async () => {
    publicDir = await fs.mkdtemp(path.join(os.tmpdir(), "logo-delete-"));
  });

  afterEach(async () => {
    await fs.rm(publicDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("deletes an uploaded logo file", async () => {
    const filePath = await writeLogo(
      publicDir,
      "logo_user-1_1794147118005.png",
    );

    expect(
      await deleteLogoFile(
        "/api/assets/logo_user-1_1794147118005.png",
        publicDir,
      ),
    ).toBe(true);
    await expect(fs.access(filePath)).rejects.toThrow();
  });

  it("deletes a logo referenced by its legacy direct path", async () => {
    const filePath = await writeLogo(publicDir, "logo_hash123.png");

    expect(await deleteLogoFile("/assets/logo_hash123.png", publicDir)).toBe(
      true,
    );
    await expect(fs.access(filePath)).rejects.toThrow();
  });

  it("refuses paths outside the assets route", async () => {
    const filePath = await writeLogo(
      publicDir,
      "logo_user-1_1794147118005.png",
    );
    const outside = path.join(publicDir, "logo_user-1_1794147118005.png");
    await fs.writeFile(outside, "png");

    expect(
      await deleteLogoFile("../logo_user-1_1794147118005.png", publicDir),
    ).toBe(false);
    expect(await deleteLogoFile("/assets/noimage.png", publicDir)).toBe(false);
    expect(
      await deleteLogoFile(
        `/api/assets/${"../"}logo_user-1_1794147118005.png`,
        publicDir,
      ),
    ).toBe(false);
    await expect(fs.access(filePath)).resolves.toBeUndefined();
    await expect(fs.access(outside)).resolves.toBeUndefined();
  });

  it("reports false when the file is already gone", async () => {
    expect(
      await deleteLogoFile(
        "/api/assets/logo_user-1_1794147118005.png",
        publicDir,
      ),
    ).toBe(false);
  });
});
