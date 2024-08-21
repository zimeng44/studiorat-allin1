/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**/*",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**/*",
      },
      {
        protocol: "https",
        hostname: "zimeng.dev",
        // port: "",
        pathname: "/api/uploads/**/*",
      },
      {
        protocol: "https",
        hostname: "api.zimeng.dev",
        port: "",
        pathname: "/uploads/**/*",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
