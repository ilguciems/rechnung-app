import { safeRedirectPath } from "../safe-redirect-path";

describe("safeRedirectPath", () => {
  it("keeps relative paths, including query and hash", () => {
    expect(safeRedirectPath("/invoices")).toBe("/invoices");
    expect(safeRedirectPath("/invoices?page=2")).toBe("/invoices?page=2");
    expect(safeRedirectPath("/invoices#top")).toBe("/invoices#top");
  });

  it("decodes encoded relative paths", () => {
    expect(safeRedirectPath("%2Finvoices%3Fpage%3D2")).toBe("/invoices?page=2");
  });

  it("rejects absolute and protocol-relative URLs", () => {
    expect(safeRedirectPath("https://evil.example")).toBe("/");
    expect(safeRedirectPath("//evil.example")).toBe("/");
    expect(safeRedirectPath("/%2Fevil.example")).toBe("/");
    expect(safeRedirectPath("/\\evil.example")).toBe("/");
    expect(safeRedirectPath("\\\\evil.example")).toBe("/");
  });

  it("falls back when the value is missing or malformed", () => {
    expect(safeRedirectPath(null)).toBe("/");
    expect(safeRedirectPath(undefined)).toBe("/");
    expect(safeRedirectPath("")).toBe("/");
    expect(safeRedirectPath("%E0%A4%A")).toBe("/");
  });

  it("uses the provided fallback", () => {
    expect(safeRedirectPath(null, "")).toBe("");
    expect(safeRedirectPath("https://evil.example", "/home")).toBe("/home");
  });
});
