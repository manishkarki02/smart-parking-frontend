import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Bind to all interfaces so the container port is reachable from the host
    host: "0.0.0.0",
    port: 5173,
    // When running inside Docker the backend is at the service name, not localhost
    proxy: {
      "/api": {
        target: process.env.VITE_API_TARGET || "http://localhost:8080",
        changeOrigin: true,
      },
    },
    // Polling-based file watching — required for bind-mounted volumes on macOS / Windows
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
});
