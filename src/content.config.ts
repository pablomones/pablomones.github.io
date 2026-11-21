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

/** Pages CMS puede guardar números y casillas como texto o vacíos: se aceptan las dos formas. */
const toNumber = (v: unknown) => (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v)) ? Number(v) : empty(v));
const toBoolean = (v: unknown) => (v === 'true' ? true : v === 'false' ? false : empty(v));
const flag = z.preprocess(toBoolean, z.boolean().default(false));
const order = z.preprocess(toNumber, z.number({ error: 'Falta el orden (un número: 1 va primero).' }));

/**
 * Pages CMS guarda la subsección como ruta ("src/content/research-sections/working-papers.yaml").
 * La web usa solo el nombre del archivo ("working-papers").
 */
const fileId = (v: unknown) => (typeof v === 'string' ? v.trim().replace(/^.*\//, '').replace(/\.ya?ml$/, '') : v);

/** Una imagen subida a src/assets/ desde Pages CMS ("/src/assets/x.png") o escrita a mano. */
const imagePath = z.preprocess(
  empty,
  z
    .string()
    .trim()
    .transform((v) => '/' + v.replace(/^\/+/, ''))
    .refine((v) => v.startsWith('/src/assets/') && /\.(jpe?g|png|webp)$/i.test(v), {
      error: 'La imagen tiene que estar en src/assets/ y ser .jpg, .png o .webp.',
    })
    .refine((v) => existsSync(join(process.cwd(), v)), {
      error: 'No encuentro esa imagen en src/assets/. Subila de nuevo.',
    })
    .optional(),
);

const yearMonth = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 7) : typeof v === 'string' ? v.trim().slice(0, 7) : v),
  z.string({ error: 'Falta la fecha (año y mes, por ejemplo 2026-03).' }).regex(/^\d{4}-(0[1-9]|1[0-2])$/, {
    error: 'La fecha tiene que ser año y mes, por ejemplo 2026-03.',
  }),
);

// Un botón de un paper ("Botones" en el editor): un link o un PDF, y un texto opcional.
// Sin texto, la web pone uno automático (ver src/lib/buttons.ts).
const attachment = z
  .object({ label: optionalText, url: link, file: pdf })
  .refine((v) => v.url !== undefined || v.file !== undefined, {
    error: 'Cada botón necesita un link o un PDF.',
  })
  .refine((v) => v.url === undefined || v.file === undefined, {
    error: 'Cada botón lleva un link o un PDF, no los dos. Para las dos cosas, agregá dos botones.',
  });

const papers = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/papers' }),
  schema: z.object({
    title: text('el título'),
    section: z.preprocess(fileId, reference('researchSections')),
    date: yearMonth,
    coauthors: list(z.object({ name: text('el nombre del coautor'), url: link })),
    arxiv: z.preprocess(
      empty,
      z
        .string()
        .trim()
        .regex(/^\d{4}\.\d{4,5}(v\d+)?$/, {
          error: 'El número de arXiv tiene que ser como 2504.14354 (sin "arXiv:" y sin el link).',
        })
        .optional(),
    ),
    journal: optionalText,
    status: optionalText,
    attachments: list(attachment),
    abstract: text('el abstract'),
    selected: flag,
    hidden: flag,
  }),
});

const researchSections = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/research-sections' }),
  schema: z.object({
    name: text('el nombre de la subsección'),
    order,
    intro: optionalText,
  }),
});

const teaching = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/teaching' }),
  schema: z.object({
    course: text('el nombre del curso'),
    term: text('el período (por ejemplo Fall o Winter)'),
    year: z.preprocess(toNumber, z.number({ error: 'Falta el año (un número, por ejemplo 2026).' }).int().min(2000).max(2100)),
    role: text('el rol (por ejemplo Teaching Assistant)'),
    code: optionalText,
    professor: optionalText,
    level: optionalText,
    evaluation: optionalText,
    materials: link,
    hidden: flag,
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
      // Pages CMS guarda "/src/assets/x.png"; image() necesita la ruta relativa a este archivo.
      logo: z.preprocess(
        (v) => (typeof v === 'string' && v.trim().startsWith('/src/') ? '../../' + v.trim().slice(5) : empty(v)),
        image().optional(),
      ),
      order: z.preprocess(toNumber, z.number().default(1)),
      hidden: flag,
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
    order,
    intro: optionalText,
    items: list(sectionItem),
    hidden: flag,
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
    photo: imagePath,
    cv: pdf,
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
