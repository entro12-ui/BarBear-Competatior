import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow phone/LAN access to Next.js assets in development
  allowedDevOrigins: ["192.168.1.6", "172.20.10.2", "localhost"],
  images: {
    remotePatterns: [],
    unoptimized: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
