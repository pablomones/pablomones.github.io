import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse as parseYaml } from 'yaml';
import { RESERVED_SLUGS, slugify } from './lib/slug';

// Los mensajes de error están en español porque los lee Pablo cuando una publicación falla.
// Astro ya dice el archivo y el campo; el mensaje explica qué arreglar.

const MAX_PDF_MB = 95;

/** Pages CMS a veces guarda un campo vacío como '' o null: lo tratamos como "no está". */
const empty = (v: unknown) => (v === '' || v === null ? undefined : v);

const text = (what: string) =>
  z.string({ error: `Falta ${what}.` }).trim().min(1, { error: `Falta ${what}: el campo está vacío.` });

const optionalText = z.preprocess(empty, z.string().trim().optional());

const link = z.preprocess(
  empty,
  z
    .string()
    .trim()
    .refine((v) => /^(https?:\/\/|mailto:|\/)/.test(v), {
      error: 'El link tiene que empezar con https://, mailto: o /.',
    })
    .optional(),
);

const pdfPath = (v: string) => join(process.cwd(), 'public', v);

/** Un PDF subido a public/files/. Se aceptan "/files/x.pdf", "files/x.pdf" y "public/files/x.pdf". */
const pdf = z.preprocess(
  empty,
  z
    .string()
    .trim()
    .transform((v) => '/' + v.replace(/^\/+/, '').replace(/^public\//, ''))
    .refine((v) => v.startsWith('/files/') && v.toLowerCase().endsWith('.pdf'), {
      error: 'El PDF tiene que estar en la carpeta public/files/ y terminar en .pdf.',
    })
    .refine((v) => existsSync(pdfPath(v)), {
      error: 'No encuentro ese PDF en public/files/. Revisá que el nombre esté bien escrito o subilo de nuevo.',
    })
    .refine((v) => !existsSync(pdfPath(v)) || statSync(pdfPath(v)).size <= MAX_PDF_MB * 1024 * 1024, {
      error: `El PDF pesa más de ${MAX_PDF_MB} MB. GitHub no acepta archivos tan grandes: subilo a Drive o Zenodo y poné el link.`,
    })
    .optional(),
);

/** Una lista que puede venir vacía, como null o sin escribir. */
const list = <T extends z.ZodType>(item: T) =>
  z.preprocess((v) => (v == null || v === '' ? [] : v), z.array(item));

const yearMonth = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 7) : typeof v === 'string' ? v.trim().slice(0, 7) : v),
  z.string({ error: 'Falta la fecha (año y mes, por ejemplo 2026-03).' }).regex(/^\d{4}-(0[1-9]|1[0-2])$/, {
    error: 'La fecha tiene que ser año y mes, por ejemplo 2026-03.',
  }),
);

const attachment = z
  .object({ label: text('la etiqueta del adjunto'), url: link, file: pdf })
  .refine((v) => v.url !== undefined || v.file !== undefined, {
    error: 'Cada adjunto necesita un link, un PDF o los dos.',
  });

const papers = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/papers' }),
  schema: z.object({
    title: text('el título'),
    section: reference('researchSections'),
    date: yearMonth,
    coauthors: list(z.object({ name: text('el nombre del coautor'), url: link })),
    arxiv: z.preprocess(
      empty,
      z
        .string()
        .trim()
        .regex(/^\d{4}\.\d{4,5}(v\d+)?$/, {
          error: 'El ID de arXiv tiene que ser como 2601.01234 (sin "arXiv:" y sin el link).',
        })
        .optional(),
    ),
    url: link,
    journal: optionalText,
    status: optionalText,
    attachments: list(attachment),
    abstract: text('el abstract'),
    selected: z.boolean().default(false),
    hidden: z.boolean().default(false),
  }),
});

const researchSections = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/research-sections' }),
  schema: z.object({
    name: text('el nombre de la subsección'),
    order: z.number({ error: 'Falta el orden (un número: 1 va primero).' }),
    intro: optionalText,
  }),
});

const teaching = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/teaching' }),
  schema: z.object({
    course: text('el nombre del curso'),
    term: text('el período (por ejemplo Fall o Winter)'),
    year: z.number({ error: 'Falta el año (un número, por ejemplo 2026).' }).int().min(2000).max(2100),
    role: text('el rol (por ejemplo Teaching Assistant)'),
    code: optionalText,
    professor: optionalText,
    level: optionalText,
    evaluation: optionalText,
    materials: link,
    hidden: z.boolean().default(false),
  }),
});

const software = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/software' }),
  schema: ({ image }) =>
    z.object({
      name: text('el nombre del paquete'),
      language: z.preprocess(empty, z.string().trim().default('R')),
      status: z.enum(['In development', 'On CRAN', 'Archived'], {
        error: 'El estado tiene que ser In development, On CRAN o Archived.',
      }),
      version: optionalText,
      license: optionalText,
      description: text('la descripción'),
      install: optionalText,
      repo: link,
      docs: link,
      logo: z.preprocess(empty, image().optional()),
      order: z.number().default(1),
      hidden: z.boolean().default(false),
    }),
});

const sectionItem = z.object({
  title: text('el título del ítem'),
  description: optionalText,
  date: optionalText,
  url: link,
  file: pdf,
});

const sections = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/sections' }),
  schema: z.object({
    name: text('el nombre de la sección').refine((v) => slugify(v) !== '' && !RESERVED_SLUGS.includes(slugify(v)), {
      error: 'Ese nombre ya lo usa otra página de la web (Research, Teaching, Software, CV) o no tiene letras. Elegí otro.',
    }),
    order: z.number({ error: 'Falta el orden (un número: 1 va primero).' }),
    intro: optionalText,
    items: list(sectionItem),
    hidden: z.boolean().default(false),
  }),
});

// site.yaml es un solo objeto, no una lista: lo carga un loader propio.
// (El loader file() de Astro haría que VS Code lo marque como error, porque espera una lista.)
const SITE_FILE = 'src/data/site.yaml';

const site = defineCollection({
  loader: {
    name: 'site-yaml',
    load: async ({ store, parseData, watcher }) => {
      const sync = async () => {
        const data = await parseData({
          id: 'site',
          data: parseYaml(readFileSync(join(process.cwd(), SITE_FILE), 'utf8')),
          filePath: SITE_FILE,
        });
        store.clear();
        store.set({ id: 'site', data });
      };
      await sync();
      watcher?.add(join(process.cwd(), SITE_FILE));
      watcher?.on('change', async (changed) => {
        if (changed.replace(/\\/g, '/').endsWith(SITE_FILE)) await sync();
      });
    },
  },
  schema: z.object({
    name: text('tu nombre'),
    position: text('el cargo (por ejemplo Ph.D. Student in Economics)'),
    university: text('la universidad'),
    description: optionalText,
    bio: text('la bio'),
    links: list(
      z.object({
        label: text('la etiqueta del link'),
        url: z
          .string({ error: 'Falta el link.' })
          .trim()
          .regex(/^(https?:\/\/|mailto:)/, { error: 'El link tiene que empezar con https:// o mailto:.' }),
      }),
    ),
  }),
});

export const collections = { papers, researchSections, teaching, software, sections, site };
