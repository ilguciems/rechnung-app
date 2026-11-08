import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { deleteSupersededLogo } from "../logo-cleanup";

const OLD_LOGO_URL = "/api/assets/logo_company-1_1794147118005.png";
const NEW_LOGO_URL = "/api/assets/logo_company-1_1794147199001.png";

const createDb = (invoicesUsingLogo: number) => ({
  invoice: {
    count: vi.fn().mockResolvedValue(invoicesUsingLogo),
  },
});

const writeLogo = async (publicDir: string, fileName: string) => {
  const filePath = path.join(publicDir, "assets", fileName);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, "png");
  return filePath;
};

const exists = async (filePath: string) =>
  fs
    .access(filePath)
    .then(() => true)
    .catch(() => false);

describe("deleteSupersededLogo", () => {
  let publicDir: string;
  let oldFilePath: string;

  beforeEach(async () => {
    publicDir = await fs.mkdtemp(path.join(os.tmpdir(), "logo-cleanup-"));
    oldFilePath = await writeLogo(publicDir, path.basename(OLD_LOGO_URL));
  });

  afterEach(async () => {
    await fs.rm(publicDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("keeps a logo that an invoice snapshot still references", async () => {
    const db = createDb(1);

    expect(
      await deleteSupersededLogo(db, OLD_LOGO_URL, NEW_LOGO_URL, publicDir),
    ).toBe(false);

    expect(db.invoice.count).toHaveBeenCalledWith({
      where: { companySnapshot: { logoUrl: OLD_LOGO_URL } },
    });
    expect(await exists(oldFilePath)).toBe(true);
  });

  it("removes a logo no invoice references", async () => {
    const db = createDb(0);

    expect(
      await deleteSupersededLogo(db, OLD_LOGO_URL, NEW_LOGO_URL, publicDir),
    ).toBe(true);

    expect(db.invoice.count).toHaveBeenCalledWith({
      where: { companySnapshot: { logoUrl: OLD_LOGO_URL } },
    });
    expect(await exists(oldFilePath)).toBe(false);
  });

  it("does nothing when there was no previous logo", async () => {
    const db = createDb(0);

    expect(await deleteSupersededLogo(db, null, NEW_LOGO_URL, publicDir)).toBe(
      false,
    );

    expect(db.invoice.count).not.toHaveBeenCalled();
    expect(await exists(oldFilePath)).toBe(true);
  });

  it("does nothing when the URL did not change", async () => {
    const db = createDb(0);

    expect(
      await deleteSupersededLogo(db, OLD_LOGO_URL, OLD_LOGO_URL, publicDir),
    ).toBe(false);

    expect(db.invoice.count).not.toHaveBeenCalled();
    expect(await exists(oldFilePath)).toBe(true);
  });
});
