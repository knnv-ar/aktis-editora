# Áktis Editora — Plan técnico de referencia

> Documento principal (legal, contable, técnico, fases y costos):
> https://claude.ai/artifact/XPQqw4kZUV5p1Wss1YfGrE
>
> Estado: **plan aprobado** (3/11/2026). Newsletter en standby (se suma cuando el sitio esté funcionando; RSS desde el lanzamiento). Hosting confirmado: Cloudflare Workers. Repositorio en la cuenta personal de GitHub de Rulo (por ahora).

## Decisiones

| Tema | Decisión |
| --- | --- |
| Nombre | Áktis Editora (ἀκτίς, "rayo de luz") |
| Perfil | Híbrido: colección académica con referato + colecciones de autor |
| Modelo | Acceso abierto (web + PDF + EPUB) + impreso pago + servicios a autores |
| Licencia | La elige cada autor en el frontmatter (sugerida: CC BY-NC-SA 4.0) |
| Framework | Astro 7 (Node 22.23+), salida estática, MDX (procesador Sätteri) + Content Collections (Zod) |
| Búsqueda | Pagefind |
| Idiomas | ES/EN (i18n de Astro) |
| Hosting | Cloudflare Workers con assets estáticos (sucesor de Pages) |
| Carga | Pull request + panel Sveltia CMS en /admin (crea PRs) |
| PDF | MDX → Markdown Pandoc → Typst (lectura, imprenta con sangrado, tapa con lomo) |
| EPUB | Pandoc → EPUB 3, validado con EPUBCheck |
| Venta | Links de pago de Mercado Pago por título (frontmatter) |
| Académico | Metadatos citation_* / Dublin Core / JSON-LD + ORCID; DOI y Latindex/DOAJ en fase 5 |
| Estadísticas | Cloudflare Web Analytics (sin cookies) |

## Estructura propuesta del repositorio

```text
aktis/
├─ src/content/
│  ├─ libros/<slug>/            index.mdx · tapa.jpg · img/ · audio/
│  ├─ revistas/<revista>/       revista.yaml
│  │  └─ <año-vol-num>/          numero.mdx · tapa.jpg
│  │     └─ <articulo>/          index.mdx · img/
│  ├─ textos/<slug>/            index.mdx · img/
│  ├─ autores/<slug>.yaml
│  └─ colecciones/<slug>.yaml
├─ src/components/              YouTube, Audio, Figura, Nota, Cita, Codigo
├─ pdf/                         plantillas Typst: lectura, imprenta, tapa
├─ scripts/                     mdx → Pandoc, construir PDF/EPUB, validar ISBN
├─ public/admin/                configuración de Sveltia CMS
├─ .github/                     workflows, CODEOWNERS, plantilla de PR
└─ CONTRIBUIR.md
```

Ejemplos de frontmatter en `src/content/` (marcados como `estado: borrador`). Guía para autores en `CONTRIBUIR.md`.

**Núcleo común a todos los tipos** (mismos nombres de campo): `titulo`, `autores`, `idioma`, `resumen` (obligatorio), `resumen_en` (obligatorio en artículos con referato), `palabras_clave`, `palabras_clave_en`, `licencia`, `descargas`.

## Reglas de seguridad para el MDX de autores

- Prohibido: `import`, `export`, expresiones `{...}`, HTML crudo (`<script>`, `<iframe>`, `<style>`).
- Permitido: Markdown + componentes de la lista blanca (`YouTube`, `Audio`, `Figura`, `Nota`, `Cita`, `Codigo`).
- Archivos: JPG/PNG/WebP/SVG saneado, MP3/OGG; imagen ≤ 5 MB, audio ≤ 20 MB; se eliminan los metadatos EXIF.
- `main` protegida; merge solo con aprobación de CODEOWNERS y CI en verde.

## Fases

0. Trámites (en paralelo): INPI, dominio, contador/ARCA, alta ISBN, ISSN, presupuestos de imprenta, logo.
1. Base del sitio (2–3 semanas).
2. Formatos PDF/EPUB (2–3 semanas).
3. Flujo editorial: CI + panel (1–2 semanas).
4. Lanzamiento (1–2 semanas), después de aprobar un ejemplar de prueba impreso.
5. Académico y servicios (continuo): DOI, OAI-PMH, Latindex/DOAJ, servicios a terceros.
