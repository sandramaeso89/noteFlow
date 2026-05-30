import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Evita que Turbopack tome el lockfile del monorepo padre como raíz del proyecto.
  turbopack: {
    root: projectRoot,
  },
  // Permite peticiones desde Expo Go / emulador en la red local (IP del Mac).
  allowedDevOrigins: ["192.168.1.39", "localhost", "127.0.0.1"],
};

export default nextConfig;
