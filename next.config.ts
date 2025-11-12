import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev"],
};

export default nextConfig;

module.exports = {
  allowedDevOrigins: ["local-origin.dev", "*.local-origin.dev"],
  images: {
    localPatterns: [
      {
        pathname: "/assets/**",
      },
    ],
  },
};
