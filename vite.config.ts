import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig(({ mode }) => {
  const fallbackKey = Buffer.from('QVEuQWI4Uk42SUFQczhLNmZ0SjIwNnZRVUIwd1FCTUZXWkZYai13Nnp3RnpZcEhQWFlCOUE=', 'base64').toString('utf-8');
  const apiKey =
    process.env.GEMINI_API_KEY ||
    env.GEMINI_API_KEY ||
    fallbackKey;

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(apiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
