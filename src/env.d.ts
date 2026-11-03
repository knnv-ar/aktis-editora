declare namespace App {
  interface Locals {
    /** Ruta del MDX que se está renderizando; la usan Figura y Audio para resolver archivos relativos. */
    archivoEntrada?: string;
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_MOSTRAR_BORRADORES?: string;
  readonly PUBLIC_CF_ANALYTICS_TOKEN?: string;
}
