import type { NextConfig } from "next";

/** Static export for Cloudflare Pages (build output: `out/`). */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
