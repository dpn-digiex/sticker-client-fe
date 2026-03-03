import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.imgur.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "d20m1ujgrryo2d.cloudfront.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
