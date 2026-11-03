# Áktis Editora

Portal de Áktis Editora: libros, revistas y textos en acceso abierto.
Sitio estático hecho con [Astro](https://astro.build) y MDX, publicado en Cloudflare Workers.

## Desarrollo

Requiere Node.js 22.23 o posterior.

```bash
npm install
npm run dev        # http://localhost:4321 (muestra también los borradores)
npm run build      # valida el contenido, compila en dist/ y genera el índice de búsqueda
npm run preview    # sirve dist/ con Wrangler, como en Cloudflare
```

Para ver los borradores en una compilación: `PUBLIC_MOSTRAR_BORRADORES=true npm run build`.

## Estructura

```text
src/content/          contenido (un directorio por publicación)
  libros/<slug>/        index.mdx · tapa.jpg · img/ · audio/
  revistas/<revista>/   revista.yaml
    <año-vol-num>/        numero.mdx
      <articulo>/           index.mdx · img/
  textos/<slug>/        index.mdx · img/
  autores/<slug>.yaml
  colecciones/<slug>.yaml
  paginas/<es|en>/      páginas institucionales (servicios, acerca)
src/content.config.ts esquemas del frontmatter (validación)
src/components/mdx/   componentes permitidos en el MDX
src/pages/            rutas del sitio
scripts/              validación de contenido
```

Para publicar, ver [CONTRIBUIR.md](CONTRIBUIR.md). El plan técnico completo está en [PLAN.md](PLAN.md).
