import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { GET } from "../route";

const request = { nextUrl: { pathname: "/api/assets" } } as never;

const callRoute = async (filename: string) =>
  GET(request, { params: Promise.resolve({ filename }) });

describe("GET /api/assets/[filename]", () => {
  let tempRoot: string;
  let projectRoot: string;

  beforeEach(async () => {
    tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "assets-route-"));
    projectRoot = path.join(tempRoot, "project");
    await fs.mkdir(path.join(projectRoot, "public", "assets"), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(projectRoot, "public", "assets", "logo_company-1_1.png"),
      "png-bytes",
    );
    await fs.writeFile(
      path.join(projectRoot, "public", "assets", "notes.txt"),
      "text",
    );
    // Files a traversal payload tries to reach.
    await fs.writeFile(path.join(projectRoot, "package.json"), '{"secret":1}');
    await fs.writeFile(path.join(projectRoot, ".env"), "SECRET=leaked");
    await fs.writeFile(path.join(tempRoot, "outside.txt"), "outside");

    vi.spyOn(process, "cwd").mockReturnValue(projectRoot);
  });

  afterEach(async () => {
    await fs.rm(tempRoot, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("serves a logo from the assets directory", async () => {
    const response = await callRoute("logo_company-1_1.png");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(await response.text()).toBe("png-bytes");
  });

  it.each([
    ["../../package.json"],
    ["../../.env"],
    ["..\\..\\package.json"],
    ["..\\..\\.env"],
    ["../../../outside.txt"],
    ["..\\..\\..\\outside.txt"],
    ["/etc/passwd"],
    ["C:\\Windows\\win.ini"],
    ["."],
    [".."],
    [""],
  ])("refuses the traversal payload %j", async (filename) => {
    const response = await callRoute(filename);

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("File not found");
  });

  it("refuses files with an extension that is not served", async () => {
    const response = await callRoute("notes.txt");

    expect(response.status).toBe(404);
  });

  it("returns 404 for a missing logo", async () => {
    const response = await callRoute("logo_company-1_2.png");

    expect(response.status).toBe(404);
  });
});
