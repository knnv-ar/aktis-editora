// Lista blanca de componentes que los autores pueden usar en el MDX, sin importarlos.
// Si se agrega uno nuevo, sumarlo también a COMPONENTES_PERMITIDOS en scripts/validar-contenido.mjs.
import Audio from './Audio.astro';
import Cita from './Cita.astro';
import Codigo from './Codigo.astro';
import Figura from './Figura.astro';
import Nota from './Nota.astro';
import YouTube from './YouTube.astro';

export const componentesMdx = { Audio, Cita, Codigo, Figura, Nota, YouTube };
