import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";

/**
 * Returns the key buffer for a hex encoded 32-byte key.
 * @param secret The key as a hex string.
 * @returns {Buffer} The secret buffer.
 * @throws {Error} If the key is missing or not 32 bytes long.
 */
function getSecretBuffer(secret: string | undefined): Buffer {
  if (!secret) {
    throw new Error("DB_ENCRYPTION_KEY is missing in environment variables");
  }
  const buffer = Buffer.from(secret, "hex");
  if (buffer.length !== 32) {
    throw new Error(
      `Invalid key length: expected 32 bytes, got ${buffer.length}. Check your DB_ENCRYPTION_KEY.`,
    );
  }
  return buffer;
}

/**
 * Encrypts a given text using AES-256-GCM with DB_ENCRYPTION_KEY.
 * If the text is empty, it returns an empty string.
 * The IV is randomly generated and prepended to the encrypted text.
 * The authentication tag is appended to the encrypted text.
 * @returns {string} The encrypted text as a hexadecimal string.
 */
export function encrypt(text: string): string {
  if (!text) return "";

  return encryptWith(text, process.env.DB_ENCRYPTION_KEY ?? "");
}

/**
 * Encrypts with an explicit key. Used by the rotation tooling, which must work
 * with the previous and the new key at the same time.
 * @param text The plain text to encrypt.
 * @param secret The 32-byte key as a hex string.
 * @returns The encrypted text as a hexadecimal string.
 */
export function encryptWith(text: string, secret: string): string {
  if (!text) return "";

  const iv = randomBytes(16);
  const key = getSecretBuffer(secret);

  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("hex");
}

/**
 * Decrypts a given hash using AES-256-GCM with DB_ENCRYPTION_KEY.
 * If the hash is empty, it returns an empty string.
 * The IV is extracted from the hash and used for decryption.
 * The authentication tag is extracted from the hash and used for decryption.
 * If the hash is invalid (less than 32 bytes), it throws an error.
 * @param {string} hash The hash to decrypt as a hexadecimal string.
 * @returns {string} The decrypted text as a UTF-8 string.
 * @throws {Error} If the hash is invalid.
 */
export function decrypt(hash: string): string {
  if (!hash) return "";

  return decryptWith(hash, process.env.DB_ENCRYPTION_KEY ?? "");
}

/**
 * Decrypts with an explicit key. Used by the rotation tooling, which must work
 * with the previous and the new key at the same time.
 * @param hash The hash to decrypt as a hexadecimal string.
 * @param secret The 32-byte key as a hex string.
 * @returns The decrypted text as a UTF-8 string.
 */
export function decryptWith(hash: string, secret: string): string {
  if (!hash) return "";

  const data = Buffer.from(hash, "hex");

  if (data.length < 32) throw new Error("Invalid encrypted data format");

  const iv = data.subarray(0, 16);
  const tag = data.subarray(16, 32);
  const encrypted = data.subarray(32);

  const key = getSecretBuffer(secret);
  const decipher = createDecipheriv(ALGORITHM, key, iv);

  decipher.setAuthTag(tag);

  return decipher.update(encrypted) + decipher.final("utf8");
}

/**
 * Re-encrypts a stored value from one key to another. A value that only the new
 * key opens was rotated by an earlier run and is left untouched; a value that
 * neither key opens aborts the rotation instead of overwriting it with garbage.
 */
export function reencrypt(
  value: string,
  oldSecret: string,
  newSecret: string,
): { status: "rotated"; value: string } | { status: "already-rotated" } {
  if (!value) return { status: "already-rotated" };

  let plainText: string;

  try {
    plainText = decryptWith(value, oldSecret);
  } catch {
    try {
      decryptWith(value, newSecret);
      return { status: "already-rotated" };
    } catch {
      throw new Error("Stored value matches neither the old nor the new key");
    }
  }

  return { status: "rotated", value: encryptWith(plainText, newSecret) };
}
