import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  transpilePackages: ["@chenglou/pretext"],
};

export default nextConfig;
