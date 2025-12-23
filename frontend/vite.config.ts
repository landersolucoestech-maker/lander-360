import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Force cache bust - Build timestamp: 2023-12-23-v2
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-v2.js`,
        chunkFileNames: `assets/[name]-[hash]-v2.js`,
        assetFileNames: `assets/[name]-[hash]-v2.[ext]`
      }
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true
  }
});
