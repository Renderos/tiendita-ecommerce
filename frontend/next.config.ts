import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera .next/standalone con server.js y solo los node_modules necesarios (imagen Docker mínima)
  output: "standalone",
};

export default nextConfig;
