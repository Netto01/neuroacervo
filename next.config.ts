import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/interativos',
        destination: '/recursos-interativos',
      },
      {
        source: '/interativos/:path*',
        destination: '/recursos-interativos/:path*',
      },
    ];
  },
};

export default nextConfig;
