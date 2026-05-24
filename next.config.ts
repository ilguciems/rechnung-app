/** @type {import('next').NextConfig} */
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntlPlugin = createNextIntlPlugin();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev"],
  images: {
    qualities: [25, 50, 75, 80],
    localPatterns: [
      {
        pathname: "/assets/**",
      },
      {
        pathname: "/api/assets/**",
        search: "",
      },
    ],
  },
};

export default withNextIntlPlugin(nextConfig);
