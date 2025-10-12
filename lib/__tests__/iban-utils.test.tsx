import {
  formatIbanInput,
  getCountryCode,
  isValidIbanChecksum,
} from "../iban-utils";

describe("formatIbanInput", () => {
  it("should format an IBAN input string", () => {
    expect(formatIbanInput("DE12345678901234567890")).toBe(
      "DE12 3456 7890 1234 5678 90",
    );
  });
});

describe("isValidIbanChecksum", () => {
  it("should check if an IBAN has a valid checksum", () => {
    expect(isValidIbanChecksum("DE14500105171161985447")).toBe(true);
  });

  it("should return false if the IBAN has an invalid checksum", () => {
    expect(isValidIbanChecksum("DE14500105171161985448")).toBe(false);
  });
});

describe("getCountryCode", () => {
  it("should extract the country code from an IBAN", () => {
    expect(getCountryCode("Germany")).toBe("DE");
  });

  it("should return null if no country code is found", () => {
    expect(getCountryCode("Unknown Country")).toBe(null);
  });
});
