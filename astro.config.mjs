// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';

// Dominio definitivo pendiente (aktis.com.ar / aktiseditora.com.ar).
// Se puede sobrescribir con la variable de entorno SITE_URL.
const site = process.env.SITE_URL ?? 'https://aktis.com.ar';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    // Sätteri es el procesador de Markdown nativo de Astro 7 (también procesa el MDX).
    processor: satteri({
      features: {
        gfm: {
          footnotes: { label: 'Notas', backLabel: 'Volver a la referencia {reference}' },
        },
      },
    }),
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: { defaultLocale: 'es', locales: { es: 'es-AR', en: 'en' } },
    }),
  ],
});
