import type { ImageMetadata } from 'astro';

// La foto es src/assets/photo.jpg (o .jpeg, .png, .webp). Si no está, la web muestra un recuadro gris.
const photos = import.meta.glob<ImageMetadata>('../assets/photo.{jpg,jpeg,png,webp}', { eager: true, import: 'default' });

export const photo: ImageMetadata | undefined = Object.values(photos)[0];
