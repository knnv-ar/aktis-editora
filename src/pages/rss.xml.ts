import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { libros, textos, articulos, autoresDe, nombresDe } from '../lib/contenido';

export async function GET(context: APIContext) {
  const items = [];
  for (const l of await libros())
    items.push({
      title: l.data.titulo,
      link: `/libros/${l.id}/`,
      pubDate: l.data.fecha_publicacion,
      description: l.data.resumen,
      author: nombresDe(await autoresDe(l.data.autores)),
      categories: ['Libro', ...l.data.palabras_clave],
    });
  for (const { articulo, numero } of await articulos())
    items.push({
      title: articulo.data.titulo,
      link: `/revistas/${articulo.id}/`,
      pubDate: numero.data.fecha_publicacion,
      description: articulo.data.resumen,
      author: nombresDe(await autoresDe(articulo.data.autores)),
      categories: ['Artículo', ...articulo.data.palabras_clave],
    });
  for (const x of await textos())
    items.push({
      title: x.data.titulo,
      link: `/textos/${x.id}/`,
      pubDate: x.data.fecha_publicacion,
      description: x.data.resumen,
      author: nombresDe(await autoresDe(x.data.autores)),
      categories: ['Texto', ...x.data.palabras_clave],
    });
  items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: 'Áktis Editora',
    description: 'Novedades de Áktis Editora: libros, revistas y textos en acceso abierto.',
    site: context.site!,
    items,
    customData: '<language>es-AR</language>',
  });
}
