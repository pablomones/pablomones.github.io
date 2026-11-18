import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { plain } from './format';
import { slugify } from './slug';

export type Paper = CollectionEntry<'papers'>;
export type Course = CollectionEntry<'teaching'>;
export type Package = CollectionEntry<'software'>;
export type ExtraSection = CollectionEntry<'sections'>;

export async function getSite() {
  const entry = await getEntry('site', 'site');
  if (!entry) throw new Error('Falta el archivo src/data/site.yaml.');
  return entry.data;
}

/** El CV aparece solo si existe public/cv.pdf. */
export const hasCv = existsSync(join(process.cwd(), 'public', 'cv.pdf'));

const newestFirst = (a: Paper, b: Paper) => b.data.date.localeCompare(a.data.date) || a.data.title.localeCompare(b.data.title);

export async function getPapers(): Promise<Paper[]> {
  const papers = await getCollection('papers', (p) => !p.data.hidden);
  return papers.sort(newestFirst);
}

/** Subsecciones de Research en su orden, solo las que tienen papers. */
export async function getResearchGroups() {
  const [sections, papers] = await Promise.all([getCollection('researchSections'), getPapers()]);
  return sections
    .sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name))
    .map((section) => ({ section, papers: papers.filter((p) => p.data.section.id === section.id) }))
    .filter((group) => group.papers.length > 0);
}

/** Los papers marcados como "selected"; si no hay ninguno, los tres más nuevos. */
export async function getSelectedPapers(): Promise<Paper[]> {
  const papers = await getPapers();
  const selected = papers.filter((p) => p.data.selected);
  return selected.length > 0 ? selected : papers.slice(0, 3);
}

const TERM_RANK: Record<string, number> = { winter: 1, spring: 2, summer: 3, fall: 4, autumn: 4 };
const termRank = (term: string) => TERM_RANK[plain(term).toLowerCase()] ?? 0;

/** Cursos agrupados por rol, el más nuevo arriba. */
export async function getTeachingGroups() {
  const courses = (await getCollection('teaching', (c) => !c.data.hidden)).sort(
    (a, b) => b.data.year - a.data.year || termRank(b.data.term) - termRank(a.data.term),
  );
  const groups = new Map<string, Course[]>();
  for (const course of courses) {
    const list = groups.get(course.data.role) ?? [];
    list.push(course);
    groups.set(course.data.role, list);
  }
  return [...groups].map(([role, items]) => ({ role, courses: items }));
}

/** Paquetes agrupados por lenguaje ("R packages"). */
export async function getSoftwareGroups() {
  const packages = (await getCollection('software', (s) => !s.data.hidden)).sort(
    (a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name),
  );
  const groups = new Map<string, Package[]>();
  for (const pkg of packages) {
    const list = groups.get(pkg.data.language) ?? [];
    list.push(pkg);
    groups.set(pkg.data.language, list);
  }
  return [...groups].map(([language, items]) => ({ language, packages: items }));
}

/** Secciones extra con contenido, en su orden. */
export async function getExtraSections() {
  const sections = await getCollection('sections', (s) => !s.data.hidden && (s.data.items.length > 0 || !!s.data.intro));
  const sorted = sections.sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name));
  const seen = new Map<string, string>();
  for (const s of sorted) {
    const slug = slugify(s.data.name);
    const other = seen.get(slug);
    if (other) {
      throw new Error(`Las Secciones extra "${other}" y "${s.data.name}" tendrían la misma dirección (/${slug}/). Cambiale el nombre a una.`);
    }
    seen.set(slug, s.data.name);
  }
  return sorted.map((section) => ({ section, slug: slugify(section.data.name) }));
}

export type NavItem = { key: string; label: string; href: string };

/** El menú: About siempre; el resto solo si tiene contenido. */
export async function getNav(): Promise<NavItem[]> {
  const [research, teaching, software, extra] = await Promise.all([
    getResearchGroups(),
    getTeachingGroups(),
    getSoftwareGroups(),
    getExtraSections(),
  ]);
  const nav: NavItem[] = [{ key: 'about', label: 'About', href: '/' }];
  if (research.length) nav.push({ key: 'research', label: 'Research', href: '/research/' });
  if (teaching.length) nav.push({ key: 'teaching', label: 'Teaching', href: '/teaching/' });
  if (software.length) nav.push({ key: 'software', label: 'Software', href: '/software/' });
  for (const { section, slug } of extra) nav.push({ key: slug, label: section.data.name, href: `/${slug}/` });
  return nav;
}
