import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

/**
 * 开发环境默认代理目标。
 * 可通过 .env.development 覆盖，例如：
 * VITE_API_TARGET=http://localhost:8081
 */
const DEFAULT_API_TARGET = 'http://localhost:8080';

const cspProd = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "script-src 'self'",
  "connect-src 'self'"
].join('; ');

const cspDev = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "script-src 'self' 'unsafe-eval'",
  "connect-src 'self' ws://localhost:5173 ws://127.0.0.1:5173 http://localhost:5173 http://127.0.0.1:5173"
].join('; ');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';
  const apiTarget = env.VITE_API_TARGET || DEFAULT_API_TARGET;

  const securityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  };

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    server: {
      port: 5173,
      open: true,
      headers: {
        ...securityHeaders,
        'Content-Security-Policy': isDev ? cspDev : cspProd
      },
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true
        },
        '/auth': {
          target: apiTarget,
          changeOrigin: true
        }
      }
    },
    preview: {
      headers: {
        ...securityHeaders,
        'Content-Security-Policy': cspProd
      }
    }
  };
});
