/** Convierte un nombre en una dirección: "Work in Progress" → "work-in-progress". */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Direcciones que ya usa la web. Una Sección extra no puede llamarse así. */
export const RESERVED_SLUGS = ['research', 'teaching', 'software', 'cv', 'files', 'fonts', '404', 'index', 'sitemap', 'robots'];
