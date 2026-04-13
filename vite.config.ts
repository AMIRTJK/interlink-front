import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import compression from "vite-plugin-compression";

import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    compression({
      algorithm: "gzip",
      ext: ".gz",
    }),
    compression({
      algorithm: "brotliCompress",
      ext: ".br",
    }),

  ],

  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "src/app"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@widgets": path.resolve(__dirname, "src/widgets"),
      "@features": path.resolve(__dirname, "src/features"),
      "@entities": path.resolve(__dirname, "src/entities"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  },

  build: {
    minify: "esbuild", // Переходим на esbuild для скорости
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("antd") || id.includes("@ant-design")) return "antd-vendor";
            if (id.includes("ckeditor5")) return "ckeditor-vendor";
            if (id.includes("react-pdf") || id.includes("pdfjs-dist")) return "pdf-vendor";
            if (id.includes("recharts")) return "charts-vendor";
            if (id.includes("framer-motion")) return "motion-vendor";
            return "vendor"; // Все остальное в один вендор-чанк
          }
        },
      },
    },
    chunkSizeWarningLimit: 2000,
  },
});
