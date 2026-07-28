import { defineConfig } from '@playwright/test';
export default defineConfig({
  use: {
    headless: true,
    viewport: { width: 375, height: 812 },
    baseURL: 'http://127.0.0.1:5173',
    launchOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  },
});
