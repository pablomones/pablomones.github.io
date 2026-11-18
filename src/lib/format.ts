const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** Agrega la base de la web a una dirección interna ("/research/" → "/base/research/"). */
export function withBase(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  return `${BASE}${path}`;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "2026-03" → "March 2026". */
export function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

export function formatDate(date: Date): string {
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** ["A"] → "A"; ["A", "B"] → "A and B"; ["A", "B", "C"] → "A, B, and C". */
export function joinNames<T>(items: T[]): Array<{ item: T; sep: string }> {
  return items.map((item, i) => {
    const last = i === items.length - 1;
    const sep = last ? '' : items.length === 2 ? ' and ' : i === items.length - 2 ? ', and ' : ', ';
    return { item, sep };
  });
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function safeHref(href: string): string | null {
  if (/^(https?:\/\/|mailto:)/.test(href)) return href;
  if (href.startsWith('/') && !href.startsWith('//')) return withBase(href);
  if (href.startsWith('#')) return href;
  return null;
}

/**
 * Markdown mínimo para textos cortos que escribe Pablo: *cursiva*, **negrita** y [links](url).
 * Todo lo demás se escapa, así que no se puede romper el HTML desde el contenido.
 */
export function inline(value: string): string {
  let html = escapeHtml(value);
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label: string, href: string) => {
    const url = safeHref(href.replace(/&amp;/g, '&'));
    if (!url) return match;
    const external = /^https?:\/\//.test(url);
    return `<a href="${escapeHtml(url)}"${external ? ' rel="noopener"' : ''}>${label}</a>`;
  });
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>');
  return html;
}

/** Párrafos separados por una línea en blanco. */
export function paragraphs(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean)
    .map(inline);
}

/** Saca los [corchetes] de un texto, para comparar sin ellos. */
export function plain(value: string): string {
  return value.replace(/[[\]]/g, '').trim();
}
