import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://davidrivadeneyra.com',
  server: {
    host: '127.0.0.1',
    port: 3001
  },
  vite: {
    server: {
      strictPort: true
    }
  }
});
