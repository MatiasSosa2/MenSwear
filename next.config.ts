import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/E-commerce',
  images: {
    unoptimized: true,
  },
  // Desactiva React Compiler para descartar bloqueos de navegación en dev
  reactCompiler: false,
};

export default nextConfig;
