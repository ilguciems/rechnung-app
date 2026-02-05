import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const SECRET = process.env.DB_ENCRYPTION_KEY;

/**
 * Returns a secret buffer from the DB_ENCRYPTION_KEY environment variable.
 * If the variable is missing, it throws an error.
 * If the key length is not 32 bytes, it throws an error.
 * @returns {Buffer} The secret buffer.
 * @throws {Error} If the variable is missing or the key length is invalid.
 */

function getSecretBuffer(): Buffer {
  if (!SECRET) {
    throw new Error("DB_ENCRYPTION_KEY is missing in environment variables");
  }
  const buffer = Buffer.from(SECRET, "hex");
  if (buffer.length !== 32) {
    throw new Error(
      `Invalid key length: expected 32 bytes, got ${buffer.length}. Check your DB_ENCRYPTION_KEY.`,
    );
  }
  return buffer;
}

/**
 * Encrypts a given text using AES-256-GCM.
 * If the text is empty, it returns an empty string.
 * The encryption key is retrieved from the DB_ENCRYPTION_KEY environment variable.
 * The IV is randomly generated and prepended to the encrypted text.
 * The authentication tag is appended to the encrypted text.
 * @returns {string} The encrypted text as a hexadecimal string.
 */

export function encrypt(text: string): string {
  if (!text) return "";

  const iv = randomBytes(16);
  const key = getSecretBuffer();

  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("hex");
}

/**
 * Decrypts a given hash using AES-256-GCM.
 * If the hash is empty, it returns an empty string.
 * The decryption key is retrieved from the DB_ENCRYPTION_KEY environment variable.
 * The IV is extracted from the hash and used for decryption.
 * The authentication tag is extracted from the hash and used for decryption.
 * If the hash is invalid (less than 32 bytes), it throws an error.
 * @param {string} hash The hash to decrypt as a hexadecimal string.
 * @returns {string} The decrypted text as a UTF-8 string.
 * @throws {Error} If the hash is invalid.
 */

export function decrypt(hash: string): string {
  if (!hash) return "";

  const data = Buffer.from(hash, "hex");

  if (data.length < 32) throw new Error("Invalid encrypted data format");

  const iv = data.subarray(0, 16);
  const tag = data.subarray(16, 32);
  const encrypted = data.subarray(32);

  const key = getSecretBuffer();
  const decipher = createDecipheriv(ALGORITHM, key, iv);

  decipher.setAuthTag(tag);

  return decipher.update(encrypted) + decipher.final("utf8");
}
