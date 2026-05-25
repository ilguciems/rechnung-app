import type { formats } from "@/i18n/request";
import type messages from "./messages/en.json";

const locales = ["en", "de"] as const;

declare module "*.css";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.svg";

declare module "*.woff";
declare module "*.woff2";

declare module "*.eot";
declare module "*.ttf";
declare module "*.otf";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof locales)[number];
    Messages: typeof messages;
    Formats: typeof formats;
  }
}

declare module "next-intl/server" {
  interface AppConfig {
    Locale: (typeof locales)[number];
    Messages: typeof messages;
    Formats: typeof formats;
  }
}
