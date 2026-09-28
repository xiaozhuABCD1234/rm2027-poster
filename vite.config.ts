import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// 海报固定 1920x1080，岗位预览用相对 base，方便 dist 从任意子路径托管
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  server: { port: 5173, strictPort: true, open: false },
  preview: { port: 4173, strictPort: true },
});
