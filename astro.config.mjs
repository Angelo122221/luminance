import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  site: 'https://your-vercel-deployment.vercel.app',

  vite: {
    plugins: [tailwindcss()],
  },
});
