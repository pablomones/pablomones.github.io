// Texto automático de los botones de un paper (campo "Botones" del editor).
// Si Pablo deja el texto vacío, la web lo pone según lo que cargó: un PDF dice "PDF";
// un link dice el nombre del sitio (GitHub, SSRN…) o "Link" si el sitio no está en la lista.

const SITES: Array<[RegExp, string]> = [
  [/(^|\.)arxiv\.org$/, 'arXiv'],
  [/(^|\.)github\.com$/, 'GitHub'],
  [/(^|\.)ssrn\.com$/, 'SSRN'],
  [/(^|\.)nber\.org$/, 'NBER'],
  [/(^|\.)zenodo\.org$/, 'Zenodo'],
  [/(^|\.)osf\.io$/, 'OSF'],
  [/(^|\.)dropbox\.com$/, 'Dropbox'],
  [/^(drive|docs)\.google\.com$/, 'Google Drive'],
  [/(^|\.)doi\.org$/, 'DOI'],
  [/(^|\.)(youtube\.com|youtu\.be|vimeo\.com)$/, 'Video'],
];

/** El texto que se ve en el botón: el que escribió Pablo, o uno automático. */
export function buttonLabel(label: string | undefined, url: string | undefined, file: string | undefined): string {
  if (label) return label;
  if (file) return 'PDF';
  if (url) {
    try {
      const host = new URL(url).hostname.replace(/^www\./, '');
      const site = SITES.find(([pattern]) => pattern.test(host));
      if (site) return site[1];
    } catch {
      // Un link interno (/research/…) no tiene sitio: queda "Link".
    }
  }
  return 'Link';
}
