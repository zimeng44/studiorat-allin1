/** @type {import('next').NextConfig} */
import bundleAnalyzer from "@next/bundle-analyzer";

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb", // maximum `4.5MB/4MB` if you are using Vercel
    },
  },
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/*",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/**/*",
      },
      {
        protocol: "https",
        hostname: "zimeng.dev",
        // port: "",
        pathname: "/uploads/**/*",
      },
      {
        protocol: "https",
        hostname: "zimeng.dev",
        // port: "",
        pathname: "/api/**/*",
      },
      {
        protocol: "https",
        hostname: "studio-rat.up.railway.app",
        pathname: "/api/**/*",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default nextConfig;
