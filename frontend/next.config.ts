import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  sassOptions: {
    additionalData: `@use "@/styles/variables" as *;`,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wuodyzmlyhfijjudkkok.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  }
};

export default nextConfig;
