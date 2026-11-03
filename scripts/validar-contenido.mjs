#!/usr/bin/env node
// Valida el contenido que envían los autores antes de compilar el sitio.
// Aplica las reglas de seguridad del MDX (ver CONTRIBUIR.md) y revisa los archivos asociados.
// Los campos del frontmatter los valida Astro con los esquemas de src/content.config.ts.

import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, resolve, relative, extname, sep } from 'node:path';

const RAIZ = resolve(import.meta.dirname, '..');
const CONTENIDO = join(RAIZ, 'src', 'content');

const COMPONENTES_PERMITIDOS = new Set(['YouTube', 'Audio', 'Figura', 'Nota', 'Cita', 'Codigo']);
const IMAGENES = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg']);
const AUDIOS = new Set(['.mp3', '.ogg']);
const OTROS = new Set(['.mdx', '.yaml', '.yml', '.txt', '.md']);
const MB = 1024 * 1024;
const LIMITE = { imagen: 5 * MB, audio: 20 * MB };

const errores = [];
const error = (archivo, linea, mensaje) =>
  errores.push(`${relative(RAIZ, archivo).split(sep).join('/')}${linea ? `:${linea}` : ''}  ${mensaje}`);

async function* recorrer(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const ruta = join(dir, e.name);
    if (e.isDirectory()) yield* recorrer(ruta);
    else yield ruta;
  }
}

/** Reemplaza el código (bloques ``` y `en línea`) por espacios, conservando los saltos de línea. */
function sinCodigo(texto) {
  const borrar = (s) => s.replace(/[^\n]/g, ' ');
  return texto
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, borrar)
    .replace(/`[^`\n]+`/g, borrar);
}

const lineaDe = (texto, indice) => texto.slice(0, indice).split('\n').length;

async function validarMdx(archivo) {
  const original = await readFile(archivo, 'utf8');
  const fm = original.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  if (!fm) {
    error(archivo, 1, 'falta el frontmatter (bloque --- al comienzo)');
    return;
  }
  const desplazamiento = fm[0].split('\n').length - 1;
  const cuerpo = sinCodigo(original.slice(fm[0].length));
  const linea = (i) => lineaDe(cuerpo, i) + desplazamiento;

  for (const m of cuerpo.matchAll(/^[ \t]*(import|export)\b/gm))
    error(archivo, linea(m.index), `no se permite «${m[1]}» en el contenido`);

  for (const m of cuerpo.matchAll(/(?<!\\)[{}]/g))
    error(archivo, linea(m.index), 'no se permiten llaves { } (expresiones). Si es texto, escribí \\{ o \\}');

  for (const m of cuerpo.matchAll(/<!--/g))
    error(archivo, linea(m.index), 'los comentarios HTML no funcionan en MDX; borralos');

  for (const m of cuerpo.matchAll(/<(\/?)([A-Za-z][\w.:-]*)/g)) {
    if (m[1] === '/') continue; // las etiquetas de cierre ya se revisan en la de apertura
    const nombre = m[2];
    if (/^https?:/.test(nombre) || nombre.includes(':'))
      error(archivo, linea(m.index), 'los enlaces entre <...> no funcionan en MDX; usá [texto](url)');
    else if (!COMPONENTES_PERMITIDOS.has(nombre))
      error(
        archivo,
        linea(m.index),
        /^[a-z]/.test(nombre)
          ? `no se permite HTML (<${nombre}>); usá Markdown o un componente permitido`
          : `componente no permitido <${nombre}>. Permitidos: ${[...COMPONENTES_PERMITIDOS].join(', ')}`,
      );
  }

  // Archivos referenciados: src="./..." , transcripcion="./..." y ![](./...)
  const refs = [
    ...cuerpo.matchAll(/\b(?:src|transcripcion)=["'](\.{1,2}\/[^"']+)["']/g),
    ...cuerpo.matchAll(/!\[[^\]]*\]\((\.{1,2}\/[^)\s]+)/g),
  ];
  for (const m of refs) {
    const destino = resolve(dirname(archivo), decodeURI(m[1]));
    if (!destino.startsWith(dirname(archivo)))
      error(archivo, linea(m.index), `«${m[1]}» apunta fuera de la carpeta de la publicación`);
    else if (!existsSync(destino)) error(archivo, linea(m.index), `no existe el archivo «${m[1]}»`);
  }
}

async function validarArchivo(archivo) {
  const ext = extname(archivo).toLowerCase();
  const { size } = await stat(archivo);
  if (IMAGENES.has(ext)) {
    if (size > LIMITE.imagen) error(archivo, 0, `imagen de ${(size / MB).toFixed(1)} MB; el máximo es 5 MB`);
    if (ext === '.svg') {
      const svg = await readFile(archivo, 'utf8');
      if (/<script|on\w+\s*=|javascript:|<foreignObject/i.test(svg))
        error(archivo, 0, 'el SVG contiene scripts, eventos o foreignObject; no está permitido');
    }
  } else if (AUDIOS.has(ext)) {
    if (size > LIMITE.audio) error(archivo, 0, `audio de ${(size / MB).toFixed(1)} MB; el máximo es 20 MB`);
  } else if (!OTROS.has(ext)) {
    error(archivo, 0, `tipo de archivo no permitido (${ext || 'sin extensión'})`);
  }
}

let cantidad = 0;
for await (const archivo of recorrer(CONTENIDO)) {
  cantidad++;
  await validarArchivo(archivo);
  if (archivo.endsWith('.mdx')) await validarMdx(archivo);
}

if (errores.length) {
  console.error(`\n✗ Se encontraron ${errores.length} problema(s) en el contenido:\n`);
  for (const e of errores) console.error('  ' + e);
  console.error('\nVer CONTRIBUIR.md para las reglas de formato.\n');
  process.exit(1);
}
console.log(`✓ Contenido válido (${cantidad} archivos revisados).`);
