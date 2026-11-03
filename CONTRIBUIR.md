# Cómo publicar en Áktis

Cada publicación es una carpeta con un archivo `index.mdx` (texto en Markdown con un encabezado de datos) y sus archivos asociados. Se envía por *pull request*; el sitio se actualiza cuando el equipo editorial lo aprueba.

## 1. Crear la carpeta

| Tipo | Carpeta |
| --- | --- |
| Libro | `src/content/libros/<slug>/index.mdx` |
| Texto suelto | `src/content/textos/<slug>/index.mdx` |
| Número de revista | `src/content/revistas/<revista>/<año-vVOL-nNUM>/numero.mdx` |
| Artículo | `src/content/revistas/<revista>/<año-vVOL-nNUM>/<slug>/index.mdx` |

El `<slug>` es el nombre de la carpeta y forma parte de la dirección web: minúsculas, sin tildes y con guiones (`esteticas-del-codigo`).

Si sos autor nuevo, agregá también tu ficha en `src/content/autores/<nombre-apellido>.yaml`.

Los archivos de `src/content/` sirven de ejemplo para cada tipo.

## 2. Completar el encabezado (frontmatter)

Campos comunes a todos los tipos: `titulo`, `autores`, `idioma` (`es` o `en`), `resumen` (obligatorio), `resumen_en` (obligatorio en artículos con referato), `palabras_clave`, `palabras_clave_en`, `licencia` y `descargas`.

Licencias posibles: `CC-BY-4.0`, `CC-BY-SA-4.0`, `CC-BY-NC-4.0`, `CC-BY-NC-SA-4.0`, `CC-BY-ND-4.0`, `CC-BY-NC-ND-4.0`, `CC0-1.0`, `todos-los-derechos`.

`estado`: `borrador`, `en_revision` o `publicado`. Solo lo publicado aparece en el sitio.

## 3. Escribir el texto

Markdown común: títulos con `##`, *itálica*, **negrita**, listas, enlaces `[texto](https://...)`, notas al pie `[^1]` y bloques de código con tres comillas invertidas.

Imágenes simples: `![Descripción](./img/foto.jpg)`.

Componentes disponibles (sin importarlos):

```mdx
<Figura src="./img/foto.jpg" alt="Descripción para lectores de pantalla" pie="Epígrafe" />

<YouTube id="ID_DEL_VIDEO" titulo="Título del video" />

<Audio src="./audio/pieza.mp3" titulo="Título" transcripcion="./audio/pieza.txt" />

<Nota titulo="Opcional">Texto destacado.</Nota>

<Cita autor="Nombre" fuente="Obra, año">Texto citado.</Cita>

<Codigo titulo="sketch.js">
(aquí va un bloque de código con tres comillas invertidas)
</Codigo>
```

## Reglas (las verifica la integración continua)

- No se permite `import`, `export`, expresiones entre llaves `{ }` ni HTML (`<div>`, `<script>`, `<iframe>`…). Si necesitás escribir una llave como texto, usá `\{`.
- Solo se permiten los componentes de la lista de arriba.
- Los enlaces se escriben `[texto](url)`; no funcionan entre `< >`.
- Archivos: imágenes JPG, PNG, WebP o SVG (máximo 5 MB); audio MP3 u OGG (máximo 20 MB). Los SVG no pueden contener scripts.
- Todas las rutas a archivos son relativas a la carpeta de la publicación (`./img/...`).

Para comprobarlo antes de enviar: `npm run validar`.

## Referato

Los artículos y libros con referato se evalúan fuera de este repositorio, que es público. Entran recién cuando fueron aceptados.
