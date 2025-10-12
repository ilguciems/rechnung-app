import { formatPhone, normalizePhone } from "../phone-utils";

describe("normalizePhone", () => {
  it("should clean and convert to +49 by default", () => {
    expect(normalizePhone("030 1234567")).toBe("+49301234567");
  });

  it("should keep international prefix", () => {
    expect(normalizePhone("+1 202 555 0187")).toBe("+12025550187");
  });

  it("should reject invalid length", () => {
    expect(() => normalizePhone("12")).toThrow();
  });

  it("should reject invalid characters", () => {
    expect(() => normalizePhone("abc")).toThrow();
  });

  it("should reject invalid prefix", () => {
    expect(() => normalizePhone("00 1234567")).toThrow();
  });
});

describe("formatPhone", () => {
  it("formats German number starting with +49", () => {
    expect(formatPhone("+4915123456789")).toBe("+49 151 2345 6789");
  });

  it("formats German number starting with 0", () => {
    expect(formatPhone("01671234567")).toBe("+49 167 1234 567");
  });

  it("formats German number starting with 0049", () => {
    expect(formatPhone("0049123456789")).toBe("+49 123 4567 89");
  });

  it("formats US number", () => {
    expect(formatPhone("+13305551234")).toBe("+1 (330) 555-1234");
  });

  it("formats Danish number with +45", () => {
    expect(formatPhone("+4587293742987")).toBe("+45 8729 3742 987");
  });

  it("formats UK number with +44", () => {
    expect(formatPhone("+4476768987")).toBe("+44 7676 8987");
  });

  it("formats Latvian number with +371", () => {
    expect(formatPhone("+37179979899")).toBe("+371 7997 9899");
  });

  it("formats international number starting with 00", () => {
    expect(formatPhone("004586778899")).toBe("+45 8677 8899");
  });

  it("strips spaces and punctuation", () => {
    expect(formatPhone("+49 (151) 234-5678")).toBe("+49 151 2345 678");
  });

  it("returns empty string if input is empty", () => {
    expect(formatPhone("")).toBe("");
  });

  it("returns formatted number if code not found", () => {
    expect(formatPhone("+999123456")).toBe("+999 1234 56");
  });
});
