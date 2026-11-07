import { safeDecodeURIComponent } from "../safe-decode";

describe("safeDecodeURIComponent", () => {
  it("decodes well-formed values", () => {
    expect(safeDecodeURIComponent("%2Finvoices")).toBe("/invoices");
    expect(safeDecodeURIComponent("user%40example.com")).toBe(
      "user@example.com",
    );
    expect(safeDecodeURIComponent("plain")).toBe("plain");
  });

  it("returns the original value instead of throwing on a lone percent", () => {
    expect(() => decodeURIComponent("100%")).toThrow(URIError);
    expect(safeDecodeURIComponent("100%")).toBe("100%");
    expect(safeDecodeURIComponent("%E0%A4%A")).toBe("%E0%A4%A");
  });

  it("returns an empty string for missing values", () => {
    expect(safeDecodeURIComponent(null)).toBe("");
    expect(safeDecodeURIComponent(undefined)).toBe("");
    expect(safeDecodeURIComponent("")).toBe("");
  });
});
