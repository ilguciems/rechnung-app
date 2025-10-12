export const countryMap: Record<string, string> = {
  Deutschland: "DE",
  Germany: "DE",
  Österreich: "AT",
  Austria: "AT",
  Schweiz: "CH",
  Switzerland: "CH",
  Frankreich: "FR",
  France: "FR",
  Italien: "IT",
  Italy: "IT",
  Spanien: "ES",
  Spain: "ES",
  Belgien: "BE",
  Belgium: "BE",
  Niederlande: "NL",
  Netherlands: "NL",
  Luxemburg: "LU",
  Luxembourg: "LU",
  Schweizer: "CH",
  Schweizerland: "CH",
  Schweizerische: "CH",
  Schweizerischen: "CH",
  Latvija: "LV",
  Latvia: "LV",
  Lietuva: "LT",
  Lithuania: "LT",
  Estland: "EE",
  Estonia: "EE",
  Eesti: "EE",
  Malta: "MT",
  Bulgarien: "BG",
  Bulgaria: "BG",
};

/**
 * Returns the country code for a given country name.
 * If no country is given or the country is not found, returns null.
 * @param {string | undefined | null} country The country name to get the code for.
 * @returns {string | null} The country code or null if not found.
 */
export function getCountryCode(
  country: string | undefined | null,
): string | null {
  if (!country) return null;
  const normalized = country.trim();
  return countryMap[normalized] ?? null;
}

export const ibanPatterns: Record<string, RegExp> = {
  DE: /^DE\d{20}$/,
  AT: /^AT\d{18}$/,
  CH: /^CH\d{19}$/,
  FR: /^FR\d{25}$/,
  NL: /^NL\d{2}[A-Z]{4}\d{10}$/,
};

/**
 * Formats an IBAN input string to the standard format.
 * The function will:
 * - remove all whitespace
 * - convert the string to uppercase
 * - add spaces every 4 characters
 * - trim the string
 * - slice the string to a maximum of 39 characters (34 characters + 5 spaces maximum)
 * @param {string} value - The IBAN input string to format
 * @returns {string} - The formatted IBAN string
 */
export function formatIbanInput(value: string): string {
  return value
    .replace(/\s+/g, "")
    .toUpperCase()
    .replace(/(.{4})/g, "$1 ")
    .trim()
    .slice(0, 39); // 34 символа + 5 пробелов максимум
}

/**
 * Checks if an IBAN has a valid checksum.
 * The algorithm is based on the following steps:
 * 1. Rearrange the IBAN by moving the first 4 characters to the end.
 * 2. Convert each letter to a number (A=10, B=11, ..., Z=35)
 * 3. Calculate the remainder of the sum of the numbers modulo 97.
 * 4. If the remainder is 1, the IBAN is valid, otherwise it is invalid.
 * @param {string} iban - The IBAN to check
 * @returns {boolean} - True if the IBAN is valid, false otherwise
 */
export function isValidIbanChecksum(iban: string): boolean {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged
    .split("")
    .map((ch) =>
      ch >= "A" && ch <= "Z" ? (ch.charCodeAt(0) - 55).toString() : ch,
    )
    .join("");
  let remainder = "";
  for (let i = 0; i < numeric.length; i += 7) {
    remainder = String(Number(remainder + numeric.substring(i, i + 7)) % 97);
  }
  return Number(remainder) === 1;
}

export const genericIbanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/;

export const germanIbanRegex = /^DE\d{20}$/;

export const bicRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
