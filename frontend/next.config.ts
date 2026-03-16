import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  sassOptions: {
    additionalData: `@use "@/styles/variables" as *;`,
  },
};

export default nextConfig;
