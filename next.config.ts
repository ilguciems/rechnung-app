import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev"],
};

export default nextConfig;

module.exports = {
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
