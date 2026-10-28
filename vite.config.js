import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_API_PROXY_TARGET;

  return {
    plugins: [react()],
    server: proxyTarget
      ? {
          proxy: {
            "/server/backend": {
              target: proxyTarget,
              changeOrigin: true,
              secure: true,
            },
          },
        }
      : undefined,
  };
})
