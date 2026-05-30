import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Nạp các biến môi trường từ Vercel hoặc file .env
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        "/api": {
          // Nếu có biến VITE_API_URL thì lấy, không thì dùng link Railway làm mặc định
          target: env.VITE_API_URL || "https://genuine-insight-production-26a4.up.railway.app",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/__tests__/setup.js',
    },
  };
});