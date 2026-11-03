import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { isbnValido } from './lib/isbn';

// ---------- Piezas comunes ----------

const LICENCIAS = [
  'CC-BY-4.0',
  'CC-BY-SA-4.0',
  'CC-BY-NC-4.0',
  'CC-BY-NC-SA-4.0',
  'CC-BY-ND-4.0',
  'CC-BY-NC-ND-4.0',
  'CC0-1.0',
  'todos-los-derechos',
] as const;

const licencia = z.enum(LICENCIAS);
const idioma = z.enum(['es', 'en']);
const estado = z.enum(['borrador', 'en_revision', 'publicado']);

const isbn = z
  .string()
  .refine(isbnValido, { message: 'ISBN-13 inválido (revisá el dígito de control)' })
  .nullable()
  .optional();

const descargas = z
  .object({
    pdf: z.boolean().default(false),
    epub: z.boolean().default(false),
  })
  .default({ pdf: false, epub: false });

const impreso = z
  .object({
    disponible: z.boolean(),
    modalidad: z.enum(['a_demanda', 'stock']).optional(),
    formato: z.string().optional(),
    papel: z.string().optional(),
    encuadernacion: z.string().optional(),
    interior_color: z.boolean().optional(),
    precio_ars: z.number().positive().optional(),
    link_pago: z.url().optional(),
  })
  .default({ disponible: false });

/** Campos con el mismo nombre en todos los tipos de publicación. */
const nucleo = {
  titulo: z.string().min(1),
  autores: z.array(reference('autores')).min(1),
  idioma,
  resumen: z.string().min(1, 'El resumen es obligatorio'),
  resumen_en: z.string().optional(),
  palabras_clave: z.array(z.string()).default([]),
  palabras_clave_en: z.array(z.string()).default([]),
  licencia,
  descargas,
};

/** Usa el nombre de la carpeta como identificador (libros/<slug>/index.mdx → <slug>). */
const idPorCarpeta =
  (niveles: number) =>
  ({ entry }: { entry: string }) =>
    entry.split('/').slice(0, niveles).join('/');

// ---------- Colecciones ----------

const autores = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/autores' }),
  schema: z.object({
    nombre: z.string(),
    orcid: z
      .string()
      .regex(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/, 'ORCID con formato 0000-0000-0000-0000')
      .nullable()
      .optional(),
    afiliaciones: z.array(z.string()).default([]),
    web: z.url().nullable().optional(),
    bio_es: z.string().optional(),
    bio_en: z.string().optional(),
  }),
});

const colecciones = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/colecciones' }),
  schema: z.object({
    nombre: z.string(),
    slug: z.string(),
    referato: z.boolean().default(false),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    descripcion_es: z.string(),
    descripcion_en: z.string().optional(),
    orden: z.number().default(100),
  }),
});

const libros = defineCollection({
  loader: glob({
    pattern: '*/index.mdx',
    base: './src/content/libros',
    generateId: idPorCarpeta(1),
  }),
  schema: ({ image }) =>
    z.object({
      tipo: z.literal('libro'),
      ...nucleo,
      subtitulo: z.string().optional(),
      coleccion: reference('colecciones'),
      traducciones: z.object({ es: z.string().optional(), en: z.string().optional() }).optional(),
      fecha_publicacion: z.coerce.date(),
      edicion: z.number().int().positive().default(1),
      version: z.string().optional(),
      isbn: z.object({ impreso: isbn, pdf: isbn, epub: isbn }).optional(),
      doi: z.string().nullable().optional(),
      referato: z.boolean().default(false),
      tapa: image().optional(),
      impreso,
      estado,
    }),
});

const revistas = defineCollection({
  loader: glob({
    pattern: '*/revista.yaml',
    base: './src/content/revistas',
    generateId: idPorCarpeta(1),
  }),
  schema: z.object({
    nombre: z.string(),
    slug: z.string(),
    issn_en_linea: z.string().nullable().optional(),
    issn_impreso: z.string().nullable().optional(),
    periodicidad: z.string(),
    idiomas: z.array(idioma).default(['es']),
    referato: z.enum(['doble_ciego', 'simple_ciego', 'abierto', 'ninguno']),
    comite_editorial: z.array(reference('autores')).default([]),
    comite_cientifico: z.array(reference('autores')).default([]),
    politicas: z
      .object({
        acceso_abierto: z.boolean().default(true),
        licencia_por_defecto: licencia.optional(),
        cargos_a_autores: z.boolean().default(false),
      })
      .optional(),
  }),
});

const numeros = defineCollection({
  loader: glob({
    pattern: '*/*/numero.mdx',
    base: './src/content/revistas',
    generateId: idPorCarpeta(2),
  }),
  schema: ({ image }) =>
    z.object({
      tipo: z.literal('numero'),
      revista: reference('revistas'),
      volumen: z.number().int(),
      numero: z.number().int(),
      anio: z.number().int(),
      titulo: z.string(),
      idioma,
      resumen: z.string().min(1, 'El resumen es obligatorio'),
      resumen_en: z.string().optional(),
      fecha_publicacion: z.coerce.date(),
      editores_invitados: z.array(reference('autores')).default([]),
      descargas,
      impreso,
      tapa: image().optional(),
      estado: estado.default('publicado'),
    }),
});

const articulos = defineCollection({
  loader: glob({
    pattern: '*/*/*/index.mdx',
    base: './src/content/revistas',
    generateId: idPorCarpeta(3),
  }),
  schema: z
    .object({
      tipo: z.literal('articulo'),
      seccion: z.enum(['dossier', 'articulos', 'resenas', 'entrevistas']),
      ...nucleo,
      titulo_en: z.string().optional(),
      fechas: z
        .object({ recibido: z.coerce.date().optional(), aceptado: z.coerce.date().optional() })
        .optional(),
      referato: z.enum(['doble_ciego', 'simple_ciego', 'abierto', 'ninguno']).default('ninguno'),
      doi: z.string().nullable().optional(),
      orden: z.number().default(100),
      estado: estado.default('publicado'),
    })
    .refine((a) => a.referato === 'ninguno' || !!a.resumen_en, {
      message: 'Los artículos con referato necesitan resumen_en (abstract)',
      path: ['resumen_en'],
    }),
});

const textos = defineCollection({
  loader: glob({
    pattern: '*/index.mdx',
    base: './src/content/textos',
    generateId: idPorCarpeta(1),
  }),
  schema: z.object({
    tipo: z.literal('texto'),
    ...nucleo,
    coleccion: reference('colecciones').optional(),
    fecha_publicacion: z.coerce.date(),
    estado: estado.default('publicado'),
  }),
});

/** Páginas institucionales editables (servicios, acerca de…), una por idioma. */
const paginas = defineCollection({
  loader: glob({ pattern: '*/*.mdx', base: './src/content/paginas' }),
  schema: z.object({
    titulo: z.string(),
    descripcion: z.string(),
  }),
});

export const collections = {
  autores,
  colecciones,
  libros,
  revistas,
  numeros,
  articulos,
  textos,
  paginas,
};
