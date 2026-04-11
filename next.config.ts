import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint runs in a separate CI step; don't block builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
