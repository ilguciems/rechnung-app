/**
 * Normalizes a phone number to E.164 format.
 * Keeps only digits and a leading "+" if present.
 * Ensures it starts with "+" and country code (e.g., +49...).
 */

export function normalizePhone(phone: string): string {
  if (!phone) return "";

  // Remove spaces, dashes, parentheses, and dots
  let cleaned = phone.replace(/[^+\d]/g, "");

  // If it starts with 00 (common in Europe), convert to +
  if (cleaned.startsWith("00")) {
    cleaned = `+${cleaned.slice(2)}`;
  }

  // If it doesn’t start with +, assume Germany (+49) by default
  if (!cleaned.startsWith("+")) {
    // Remove leading zero for domestic German numbers (e.g. 030 → 30)
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.slice(1);
    }
    cleaned = `+49${cleaned}`;
  }

  // Basic validation: must be between 8 and 15 digits total (E.164 limit)
  const digitsOnly = cleaned.replace(/\D/g, "");
  if (digitsOnly.length < 8 || digitsOnly.length > 15) {
    throw new Error("Invalid phone number length");
  }

  return cleaned;
}

// List of known country codes
const knownCodes = [
  // 🇺🇸
  "1",
  // 🇩🇪
  "49",
  // 🇦🇹
  "43",
  // 🇨🇭
  "41",
  // 🇫🇷
  "33",
  // 🇮🇹
  "39",
  // 🇪🇸
  "34",
  // 🇳🇱
  "31",
  // 🇧🇪
  "32",
  // 🇩🇰
  "45",
  // 🇸🇪
  "46",
  // 🇳🇴
  "47",
  // 🇫🇮
  "358",
  // 🇮🇪
  "353",
  // 🇬🇧
  "44",
  // 🇮🇸
  "354",
  // 🇵🇹
  "351",
  // 🇬🇷
  "30",
  // 🇨🇿
  "420",
  // 🇸🇰
  "421",
  // 🇭🇺
  "36",
  // 🇵🇱
  "48",
  // 🇸🇮
  "386",
  // 🇭🇷
  "385",
  // 🇷🇸
  "381",
  // 🇧🇦
  "387",
  // 🇲🇪
  "382",
  // 🇲🇰
  "389",
  // 🇦🇱
  "355",
  // 🇧🇬
  "359",
  // 🇷🇴
  "40",
  // 🇲🇩
  "373",
  // 🇺🇦
  "380",
  // 🇧🇾
  "375",
  // 🇪🇪
  "372",
  // 🇱🇻
  "371",
  // 🇱🇹
  "370",
  // 🇱🇺
  "352",
  // 🇲🇨
  "377",
  // 🇦🇩
  "376",
  // 🇸🇲
  "378",
  // 🇻🇦
  "379",
  // 🇱🇮
  "423",
  // 🇲🇹
  "356",
  // 🇨🇾
  "357",
  // 🇬🇬
  "44",
  // 🇮🇲
  "44",
  // 🇯🇪
  "44",
  // 🇪🇺
  "388",
];

export function formatPhone(phone: string): string {
  if (!phone) return "";

  // 1. clean all non-digits without +
  let cleaned = phone.replace(/[^+\d]/g, "");

  // 2. if string starts with 00 (common in Europe), convert to +
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
  }

  // 3. if it doesn’t start with +, assume Germany (+49) by default
  if (cleaned.startsWith("0")) {
    cleaned = "+49" + cleaned.slice(1);
  }

  let code = "";

  // 5. check for known codes or fallback
  for (const c of knownCodes) {
    if (cleaned.startsWith("+" + c)) {
      code = c;
      break;
    }
  }

  // fallback if not found
  if (!code && cleaned.startsWith("+")) {
    // check for 2 or 3 digits
    const maybe3 = cleaned.slice(1, 4);
    const maybe2 = cleaned.slice(1, 3);
    if (/^\d{3}$/.test(maybe3)) {
      code = maybe3;
    } else if (/^\d{2}$/.test(maybe2)) {
      code = maybe2;
    }
  }

  // 6. get national number
  const national = cleaned.slice(code.length + 1);

  // 🇩🇪
  if (code === "49") {
    const match = national.match(/^(\d{2,3})(\d{3,4})(\d+)$/);
    if (match) return `+49 ${match[1]} ${match[2]} ${match[3]}`;
    return `+49 ${national}`;
  }

  // 🇺🇸
  if (code === "1") {
    if (national.length === 10) {
      return `+1 (${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
    }
    return `+1 ${national}`;
  }

  if (code) {
    const chunks = national.match(/.{1,4}/g);
    return `+${code} ${chunks?.join(" ") ?? ""}`.trim();
  }

  // fallback
  return cleaned;
}
