import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

/**
 * Los borradores se ven en desarrollo (npm run dev) y en compilaciones de vista previa
 * con PUBLIC_MOSTRAR_BORRADORES=true. En producción solo se publica lo que tiene
 * estado: publicado.
 */
export const mostrarBorradores =
  import.meta.env.DEV || import.meta.env.PUBLIC_MOSTRAR_BORRADORES === 'true';

const visible = (estado?: string) => mostrarBorradores || (estado ?? 'publicado') === 'publicado';

const porFecha = <T extends { data: { fecha_publicacion: Date } }>(a: T, b: T) =>
  b.data.fecha_publicacion.getTime() - a.data.fecha_publicacion.getTime();

export async function libros() {
  return (await getCollection('libros', (e) => visible(e.data.estado))).sort(porFecha);
}

export async function textos() {
  return (await getCollection('textos', (e) => visible(e.data.estado))).sort(porFecha);
}

export async function numeros() {
  return (await getCollection('numeros', (e) => visible(e.data.estado))).sort(porFecha);
}

/** Artículos visibles cuyo número también es visible. Heredan la fecha del número. */
export async function articulos() {
  const nums = new Map((await numeros()).map((n) => [n.id, n]));
  const lista = await getCollection('articulos', (e) => visible(e.data.estado));
  return lista
    .filter((a) => nums.has(numeroDe(a)))
    .map((a) => ({ articulo: a, numero: nums.get(numeroDe(a))! }));
}

/** 'revista/2027-v1-n1/articulo' → 'revista/2027-v1-n1' */
export const numeroDe = (a: CollectionEntry<'articulos'>) => a.id.split('/').slice(0, 2).join('/');

/** Revistas que tienen al menos un número visible. */
export async function revistas() {
  const conNumeros = new Set((await numeros()).map((n) => n.data.revista.id));
  return (await getCollection('revistas')).filter((r) => conNumeros.has(r.id));
}

export async function autoresDe(refs: { id: string }[]) {
  const lista = await Promise.all(refs.map((r) => getEntry('autores', r.id)));
  return lista.filter((a): a is CollectionEntry<'autores'> => !!a);
}

export const nombresDe = (autores: CollectionEntry<'autores'>[]) =>
  autores.map((a) => a.data.nombre).join(', ');

export const NOMBRES_LICENCIA: Record<string, string> = {
  'CC-BY-4.0': 'CC BY 4.0',
  'CC-BY-SA-4.0': 'CC BY-SA 4.0',
  'CC-BY-NC-4.0': 'CC BY-NC 4.0',
  'CC-BY-NC-SA-4.0': 'CC BY-NC-SA 4.0',
  'CC-BY-ND-4.0': 'CC BY-ND 4.0',
  'CC-BY-NC-ND-4.0': 'CC BY-NC-ND 4.0',
  'CC0-1.0': 'CC0 1.0 (dominio público)',
  'todos-los-derechos': 'Todos los derechos reservados',
};

export function urlLicencia(id: string): string | null {
  if (id === 'todos-los-derechos') return null;
  if (id === 'CC0-1.0') return 'https://creativecommons.org/publicdomain/zero/1.0/';
  const m = id.match(/^CC-(.+)-(\d\.\d)$/);
  return m ? `https://creativecommons.org/licenses/${m[1].toLowerCase()}/${m[2]}/` : null;
}

export function formatoFecha(fecha: Date, lang: 'es' | 'en' = 'es') {
  return fecha.toLocaleDateString(lang === 'es' ? 'es-AR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
