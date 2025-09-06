import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ don't block build because of ESLint errors
  },
};

export default nextConfig;
