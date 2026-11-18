// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// La dirección de la web se configura solo acá.
// Si algún día cambia (otro usuario o un dominio propio), se toca solo esto.
const SITE = 'https://pablomones.github.io';
const BASE = '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
});
