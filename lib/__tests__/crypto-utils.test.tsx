import { randomBytes } from "node:crypto";
import {
  decrypt,
  decryptWith,
  encrypt,
  encryptWith,
  reencrypt,
} from "../crypto-utils";

const key = () => randomBytes(32).toString("hex");

describe("encrypt / decrypt", () => {
  beforeEach(() => {
    vi.stubEnv("DB_ENCRYPTION_KEY", key());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("round-trips a value", () => {
    expect(decrypt(encrypt("mailjet-secret"))).toBe("mailjet-secret");
  });

  it("keeps empty values empty", () => {
    expect(encrypt("")).toBe("");
    expect(decrypt("")).toBe("");
  });

  it("rejects a value written with another key", () => {
    const hash = encryptWith("secret", key());

    expect(() => decrypt(hash)).toThrow();
  });
});

describe("reencrypt", () => {
  const oldKey = randomBytes(32).toString("hex");
  const newKey = randomBytes(32).toString("hex");

  it("rewrites a value for the new key", () => {
    const result = reencrypt(encryptWith("secret", oldKey), oldKey, newKey);

    expect(result.status).toBe("rotated");
    if (result.status !== "rotated") throw new Error("expected rotation");
    expect(decryptWith(result.value, newKey)).toBe("secret");
  });

  it("leaves a value that was already rotated", () => {
    const value = encryptWith("secret", newKey);

    expect(reencrypt(value, oldKey, newKey).status).toBe("already-rotated");
  });

  it("treats an empty value as nothing to do", () => {
    expect(reencrypt("", oldKey, newKey).status).toBe("already-rotated");
  });

  it("refuses a value that neither key opens", () => {
    const foreign = encryptWith("secret", key());

    expect(() => reencrypt(foreign, oldKey, newKey)).toThrow(
      "Stored value matches neither the old nor the new key",
    );
  });
});
