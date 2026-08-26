import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow phone/LAN access to Next.js assets in development
  allowedDevOrigins: ["172.20.10.2", "localhost"],
  images: {
    remotePatterns: [],
    unoptimized: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
