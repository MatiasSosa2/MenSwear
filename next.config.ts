import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desactiva React Compiler para descartar bloqueos de navegación en dev
  reactCompiler: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "http2.mlstatic.com",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/process_payment",
        destination: "/api/process_payment",
      },
    ];
  },
};

export default nextConfig;
