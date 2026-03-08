// @ts-check

import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://gehri.xyz',
  output: 'server',
  adapter: cloudflare({ imageService: 'compile' }),
  session: {
    driver: 'memory',
  },
  integrations: [mdx(), sitemap()],
});
