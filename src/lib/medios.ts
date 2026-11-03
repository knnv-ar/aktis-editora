import type { ImageMetadata } from 'astro';

// Todos los medios que viven junto al contenido, indexados por ruta absoluta del proyecto.
const imagenes = import.meta.glob<{ default: ImageMetadata }>(
  '/src/content/**/*.{jpg,jpeg,png,webp,svg}',
  { eager: true },
);
const audios = import.meta.glob<string>('/src/content/**/*.{mp3,ogg}', {
  eager: true,
  query: '?url',
  import: 'default',
});
const textosPlanos = import.meta.glob<string>('/src/content/**/*.txt', {
  eager: true,
  query: '?raw',
  import: 'default',
});

/**
 * Convierte una ruta relativa escrita por el autor ("./img/foto.jpg") en la ruta
 * del proyecto ("/src/content/libros/x/img/foto.jpg"), tomando como base el archivo MDX.
 */
export function resolverRuta(archivoMdx: string | undefined, src: string): string | null {
  if (!archivoMdx || !src.startsWith('.')) return null;
  const base = '/' + archivoMdx.replace(/\\/g, '/').replace(/^\/+/, '');
  const url = new URL(src, 'file://' + base);
  return decodeURIComponent(url.pathname);
}

export const imagen = (archivo: string | undefined, src: string) => {
  const ruta = resolverRuta(archivo, src);
  return ruta ? (imagenes[ruta]?.default ?? null) : null;
};

export const audio = (archivo: string | undefined, src: string) => {
  const ruta = resolverRuta(archivo, src);
  return ruta ? (audios[ruta] ?? null) : null;
};

export const textoPlano = (archivo: string | undefined, src: string) => {
  const ruta = resolverRuta(archivo, src);
  return ruta ? (textosPlanos[ruta] ?? null) : null;
};
