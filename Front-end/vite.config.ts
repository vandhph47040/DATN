import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Cố định cổng
    strictPort: true, // Ngăn không cho tự động chuyển sang cổng khác nếu 5173 bị chiếm
  },
});
