import type { NextConfig } from "next";

const isExport = process.env.BUILD_TARGET === "export";

const nextConfig: NextConfig = {
  ...(isExport ? { output: "export" } : {}),
};

export default nextConfig;
