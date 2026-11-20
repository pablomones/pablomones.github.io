import type { ImageMetadata } from 'astro';

// Todas las imágenes de src/assets/. La foto que se usa es la que indica el campo `photo` de site.yaml
// (por ejemplo "/src/assets/photo.jpg"), que Pablo cambia desde Pages CMS.
const images = import.meta.glob<ImageMetadata>('../assets/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' });

/** Devuelve la imagen de src/assets/ que corresponde a la ruta, o nada si no hay foto. */
export function findImage(path: string | undefined): ImageMetadata | undefined {
  if (!path) return undefined;
  const name = path.split('/').pop();
  const key = Object.keys(images).find((k) => k.split('/').pop() === name);
  return key ? images[key] : undefined;
}
