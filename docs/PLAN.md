# Plan — Web académica de Pablo Mones

Última actualización: 18/11/2026. Este archivo resume todo lo decidido antes de escribir código.

## Links

| Qué | Link |
| --- | --- |
| Prototipos (13 diseños, canvas) | https://claude.ai/artifact/RkFxMGpdAjgxVHFH2G3Fn7 |
| Plan para Pablo (resumido, sin precio) | https://claude.ai/artifact/1v4XzBBjsiiP6yBPscEJ51 |
| Plan interno (pestañas Principal e Implementación) | https://claude.ai/artifact/4abnKtboE8LucPQ8Sg59uq |

Los tres son privados: hay que compartirlos desde **Share** antes de mandárselos a Pablo.

## Contexto

- Pablo Mones es doctorando en Economía. La web es su sitio académico personal, en inglés.
- Referencias que le gustan: ipitman.github.io (la favorita), kenmiyahara.com y jarellanobover.com. La idea es que se parezca, no que sea igual.
- Juani construye y entrega. Después Pablo la mantiene solo, sin tocar código.
- Precio: lo maneja Juani directamente con Pablo y **no figura en nada de lo que se le manda a Pablo**.

## Estado

1. Plan aprobado.
2. Pablo eligió el diseño **J · Editorial ajustada** (18/11).
3. Etapas 1 a 3 hechas con contenido de ejemplo entre [corchetes] y publicadas en https://pablomones.github.io (18/11). El código vive en el repo de Pablo: `main` es lo publicado y `develop` el trabajo en curso.

## Prototipos

| Letra | Nombre | Archivo en el canvas | Nota |
| --- | --- | --- | --- |
| A | Clásica | Main.dc.html | Basada en Pitman: columna lateral con foto y links |
| B | Simple | Simple.dc.html | Colores suaves, inicio solo con foto, bio y links |
| C | Editorial | Editorial.dc.html | Basada en Arellano-Bover: nombre y foto grandes |
| D | Moderna | Moderna.dc.html | Oscura por defecto, con modo claro |
| E | Paper | Paper.dc.html | La web armada como un paper |
| F | Color | Color.dc.html | Franja azul, tarjetas de colores |
| G | Bento | Bento.dc.html | Grilla de bloques, con modo oscuro |
| H | Técnica | Grafico.dc.html | Oscura y sobria, referencias numeradas, botón BibTeX |
| I | Póster | Poster.dc.html | Póster suizo: barra negra arriba y bloque rojo en el inicio |
| J | Editorial ajustada | Editorial2.dc.html | La C con los comentarios de Pablo: nombre en una línea y más chico (misma letra, Instrument Serif), About debajo del nombre, "Selected research" sin números, Inter para el resto, títulos más chicos. **Elegido por Pablo** |
| K | Editorial sobria | Editorial3.dc.html | Igual que J pero todo en Inter, también el nombre |
| L | Margen | Margen.dc.html | Blanca y sobria: columna izquierda con nombre, menú y contacto; IBM Plex Sans + Mono; un punto naranja como acento |
| M | Sobria | Sobria.dc.html | Blanca y sobria: una columna, foto redonda, Newsreader + Inter, acento verde |

Todos tienen varias páginas (About, Research, Teaching, Software, CV). En ninguno hay link a Google Scholar: Pablo no lo quiere.

## Decisiones tomadas

| Tema | Decisión |
| --- | --- |
| Stack | Astro (salida estática) + Pages CMS como editor. Quarto solo si Pablo pide editar desde RStudio |
| Repo | En la cuenta de Pablo desde la etapa 1: `pablomones.github.io`. Juani es colaborador. Pablo crea la cuenta y el repo vacío, activa GitHub Pages y suma a Juani, todo con una guía con capturas |
| Dominio | Ninguno: `pablomones.github.io`. Costo fijo USD 0. Se puede sumar después |
| Control de calidad | Sin pull requests: se trabaja en `develop` y `main` es lo publicado (pedido de Juani, 18/11). Los chequeos de tipos, esquemas, build y links frenan la publicación si fallan. Lo visual se revisa con `npm run dev` antes de cada push |
| Botones de un paper | Lista de botones: cada uno un link o un PDF de hasta 95 MB, no los dos. El texto es opcional: sin texto, la web pone PDF, GitHub, SSRN… (20/11, para simplificar el editor). Los paquetes de replicación van siempre como link |
| Campos vacíos | Un campo opcional vacío no se muestra (ni etiqueta ni botón). Excepción: un paper sin coautores dice "Solo-authored" |
| Secciones vacías | Una sección sin contenido visible no aparece en el menú ni genera página |
| Secciones extra | Pablo crea secciones nuevas (por ejemplo Presentations) desde Pages CMS: nombre, texto e ítems con descripción y link o PDF |
| Subsecciones de Research | Pablo las crea, renombra y ordena desde Pages CMS. Vienen Job Market Paper, Working Papers, Publications y Work in Progress. Cada paper elige la suya de un desplegable (campo Reference). Si el campo Reference no anda, se pasa a un tipo "Other" con nombre libre |
| Links del perfil | Lista libre de etiqueta + URL. Arranca con email, GitHub y ORCID. Sin Google Scholar |
| Editor | Etiquetas de Pages CMS en español (Perfil, Papers, Subsecciones de Research, Secciones extra…) |
| Mantenimiento | Pablo es el dueño. Hay 30 días de soporte después de la entrega. Lo que el editor no cubre (por ejemplo, un cambio de diseño) se lo pide a Juani |
| BibTeX | Solo si Pablo elige H o lo pide. Suma más o menos 1 hora |
| CV | Sin página propia ni ítem en el menú: un link "CV (PDF)" junto a Email y GitHub abre el PDF (pedido de Pablo, 18/11) |
| About | Debajo del nombre va la bio y, abajo, "Selected research" con los papers, sin números. Sin línea de "Interests" (pedido de Pablo, 18/11) |
| Favicon | La corona de Columbia (pedido de Pablo, 18/11), de Wikimedia Commons (CC BY-SA 4.0), sin el "1754". Hay SVG, PNG de 32 px y apple-touch-icon. Crédito en el README |
| Logo del paquete | El hexágono de `arma.panel.ife` (está en `man/figures/logo.png` de su repo) va en la sección Software |
| Estado del paper | Campo opcional `status`, por ejemplo "Revise & Resubmit · [Journal X]". Se muestra debajo de los autores (pedido de Pablo, 18/11) |

## Stack y decisiones técnicas

- Astro 7.4 con salida 100% estática, TypeScript estricto y Node 24 LTS (el mismo en local y en GitHub Actions).
- Contenido en YAML, validado con esquemas zod en `src/content.config.ts`.
- Deploy con GitHub Actions a GitHub Pages. `site` y `base` se configuran en un solo lugar.
- Casi nada de JavaScript en el navegador: un botón "Abstract +" (con `aria-expanded`) despliega el abstract y abre el del paper que viene en el link; otro copia el comando de instalación. Se dejó `<details>` porque no permite poner el botón en la misma fila que arXiv y PDF, como en el diseño. Sin JavaScript, los abstracts se ven siempre.
- Tipografías servidas desde la propia web. CSS propio con variables, sin Tailwind.
- La foto se optimiza al compilar (WebP, varios tamaños).
- SEO: título y descripción por página, Open Graph, sitemap, robots.txt y URL canónica.
- Accesibilidad: HTML semántico, navegación con teclado y contraste de 4.5 a 1. Meta: 95 o más en Lighthouse.
- Dependencias con versiones fijas y sin Dependabot.

## Estructura del repo

```text
pablomones.github.io/
├─ src/
│  ├─ content/                ← lo que edita Pablo
│  │  ├─ papers/              un .yaml por paper
│  │  ├─ research-sections/   un .yaml por subsección de Research
│  │  ├─ teaching/            un .yaml por curso
│  │  ├─ software/            un .yaml por paquete
│  │  └─ sections/            un .yaml por Sección extra
│  ├─ data/site.yaml          ← nombre, bio, afiliación, intereses, links y formación
│  ├─ assets/photo.jpg        ← la foto
│  ├─ content.config.ts       esquemas que validan cada campo
│  ├─ layouts/  components/  pages/  styles/
├─ public/
│  ├─ cv.pdf                  ← el CV
│  └─ files/                  ← PDFs que sube Pablo (hasta 95 MB cada uno)
├─ .github/workflows/         deploy a GitHub Pages
├─ .pages.yml                 configuración de Pages CMS
├─ docs/GUIA.md               guía de edición en español, para Pablo
├─ CLAUDE.md  README.md  astro.config.mjs  package.json
```

## Modelo de contenido

**Papers** (`src/content/papers/`)

| Campo | Obligatorio | Uso |
| --- | --- | --- |
| `title` | Sí | Título; despliega el abstract |
| `section` | Sí | Referencia a una subsección de Research |
| `date` | Sí | Año y mes; ordena la lista, el más nuevo arriba |
| `coauthors` | No | Sin Pablo. Cada coautor puede tener link a su web. Vacío = "Solo-authored" |
| `arxiv` | No | Número de arXiv; arma los botones arXiv y PDF |
| `attachments` | No | "Botones" en el editor: cada uno un link o un PDF, con texto opcional (sin texto: PDF, GitHub, SSRN… según lo cargado). Reemplaza al viejo campo `url` (20/11) |
| `journal` | No | Debajo del título |
| `status` | No | Estado del paper, por ejemplo "Revise & Resubmit · [Journal X]" |
| `abstract` | Sí | Aparece al desplegar |
| `selected` | No | Aparece en "Selected research" del inicio. Si ninguno está marcado, van los tres más nuevos |
| `hidden` | No | Oculta el paper sin borrarlo |

**Subsecciones de Research** (`src/content/research-sections/`): `name`, `order`, `intro` (opcional). Borrar una que todavía tiene papers frena el build con un error que nombra esos papers.

**Teaching** (`src/content/teaching/`): `course`, `term` + `year`, `role`, y opcionales `code`, `professor`, `level`, `materials` y `hidden`. Los cursos se agrupan por `role`.

**Software** (`src/content/software/`): `name`, `language` (R si se deja vacío), `status` (In development, On CRAN, Archived), `description`, y opcionales `version`, `license`, `logo`, `install`, `repo`, `docs`, `order` y `hidden`. Se agrupan por lenguaje ("R packages").

**Secciones extra** (`src/content/sections/`): `name` (define la dirección), `order`, `intro` e `items` (cada ítem: `title` obligatorio y, opcionales, `description`, `date`, link y PDF). Un ítem sin link ni PDF queda como texto. Si el nombre choca con research, teaching, software o cv, el build falla.

**Datos generales** (`src/data/site.yaml`): `name`, `position`, `university`, `description` (opcional, para buscadores), `bio` (admite *cursiva*, **negrita** y links) y `links` (etiqueta + URL). Se sacaron `location`, `interests` y `education` porque el diseño J no los muestra. El link "CV (PDF)" aparece solo, primero, si existe `public/cv.pdf`.

La fecha de "Last updated" se pone sola al publicar.

## Páginas

| Página | Dirección | Comportamiento |
| --- | --- | --- |
| About | `/` | Cargo y universidad, nombre, bio, links (CV primero), foto y "Selected research" |
| Research | `/research/` | Subsecciones en su orden; cada una aparece solo si tiene papers. Cada paper tiene su ancla (`/research/#nombre`) que abre el abstract desplegado |
| Teaching | `/teaching/` | Aparece en el menú solo si hay cursos |
| Software | `/software/` | Aparece en el menú solo si hay paquetes; logo, versión y licencia; el comando de instalación se puede copiar |
| Sección extra | `/nombre/` | Intro y lista de ítems |
| 404 | cualquier otra | Mensaje y link al inicio |

## Etapas

Son 27 horas en total. Con Claude Code, el tiempo de Juani se estima en 12 a 15 horas, repartidas en unas 4 sesiones.

| # | Etapa | Qué se hace | Lista cuando | Horas |
| --- | --- | --- | --- | --- |
| 1 | Esqueleto y deploy | Proyecto Astro, marco común y páginas vacías, publicadas en `pablomones.github.io`. Antes, Pablo crea la cuenta y el repo, activa Pages y suma a Juani | Se recorren las páginas desde el menú online | 3 |
| 2 | Contenido como datos | **Primero:** probar el campo Reference de Pages CMS. Después, los esquemas de papers (con adjuntos), subsecciones, cursos, paquetes, Secciones extra y `site.yaml` | Un dato mal escrito frena la publicación con un error claro | 5 |
| 3 | Páginas con el diseño | Cada página como en el diseño elegido: abstracts, anclas, menú que oculta secciones vacías, Secciones extra y versión de celular | Se ve igual al diseño a 1280 y a 390 px. **Primera ronda de cambios de Pablo** | 8 |
| 4 | Contenido real, SEO y calidad | Bio, foto, papers, cursos, paquete y CV de Pablo; SEO; Lighthouse | No queda ningún [corchete], Lighthouse da 95 o más y se probó en celulares reales. **Segunda ronda de cambios** | 5 |
| 5 | Editor (Pages CMS) | `.pages.yml` con etiquetas en español. Probar la subida desde la compu de un PDF de unos 90 MB | Pablo agrega un paper y lo ve online a los 2 minutos | 3 |
| 6 | Documentación y entrega | `docs/GUIA.md` con capturas reales, README y CLAUDE.md | Pablo sigue la guía sin ayuda | 3 |

## Pruebas

**Automáticas, en cada publicación:** tipos de TypeScript, esquemas de todo el contenido, build completo y links internos rotos.

**Manuales, antes de entregar:**

- [ ] Cada página a 390, 768 y 1280 px, en modo claro y, si el diseño lo tiene, en oscuro
- [ ] Chrome, Safari y Firefox; un iPhone y un Android reales
- [ ] Toda la web recorrida solo con el teclado
- [ ] Lighthouse con 95 o más en las cuatro categorías
- [ ] Un campo mal escrito frena la publicación con un error entendible
- [ ] El link directo a un paper abre su abstract desplegado
- [ ] Una sección vacía no aparece; una Sección extra nueva aparece sola
- [ ] Una subsección creada desde Pages CMS aparece en su posición; borrar una con papers da un error claro
- [ ] Un PDF de unos 90 MB subido desde Pages CMS se publica y se descarga
- [ ] La vista previa del link se ve bien en WhatsApp y LinkedIn
- [ ] Una dirección inventada muestra la 404
- [ ] Un cambio desde Pages CMS aparece online en menos de 2 minutos

## Riesgos

| Riesgo | Qué hacemos |
| --- | --- |
| Pablo tarda en mandar contenido | Las etapas 1 a 3 avanzan con [corchetes]; solo la 4 espera |
| El usuario `pablomones` no está libre | La web queda en `otronombre.github.io`; la dirección está en un solo lugar |
| Pablo escribe mal un campo | La publicación falla y queda online la versión anterior; la guía explica el error |
| El campo Reference de Pages CMS no anda | Se prueba al arrancar la etapa 2; si falla, se usa un tipo "Other" con nombre libre |
| Pages CMS no deja subir el PDF desde la compu o falla con archivos grandes | Se prueba en la etapa 5; si falla, los PDFs grandes van como link (Drive o Zenodo) |
| Pages CMS cierra o cambia | El contenido son YAML en el repo: se sigue editando desde GitHub o con Claude |
| Crece el alcance (blog, página por paper) | Queda fuera de este plan y se habla aparte |

## Cómo se trabaja con Claude Code

1. Antes de cada etapa, Claude dice qué archivos va a crear o cambiar, y arranca con el OK de Juani.
2. Al terminar, corre las pruebas automáticas y muestra el resultado tal cual, aunque falle.
3. Juani lo mira con `npm run dev` y lo compara con el diseño elegido.
4. Con el OK, commit a `develop` y push: GitHub Actions valida. Para publicar, se pasa `develop` a `main`.

Claude no hace push ni cambios en la cuenta de Pablo sin que se lo pidan.
