"use client";

/**
 * Set a cookie on the client side.
 * NOTE: document.cookie is the only way to set cookies from the browser.
 */
export function setClientCookie(name: string, value: string, days = 365): void {
  // biome-ignore lint/suspicious/noDocumentCookie: client-side cookie is required for server-side locale detection
  document.cookie = `${name}=${value};path=/;max-age=${days * 24 * 60 * 60};SameSite=Lax`;
}

export function getClientCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}
