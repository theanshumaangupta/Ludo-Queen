import type { NextConfig } from "next";
import dotenv from "dotenv"
dotenv.config({ path: "../../.env" })
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
