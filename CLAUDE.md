# CLAUDE.md

Web académica personal de **Pablo Mones** (doctorando en Economía), en inglés, publicada en `pablomones.github.io`. La construye Juani y después la edita Pablo solo, sin tocar código, desde Pages CMS.

El plan completo, con las decisiones, el modelo de contenido, las etapas, las pruebas y los riesgos, está en [docs/PLAN.md](docs/PLAN.md). Leelo antes de proponer cambios.

## Estado actual

- Diseño elegido por Pablo: **J · Editorial ajustada** (`Editorial2.dc.html` en https://claude.ai/artifact/RkFxMGpdAjgxVHFH2G3Fn7).
- Hechas, en `develop`: etapas 1 a 3 (esqueleto, contenido como datos y páginas con el diseño), con contenido de ejemplo entre [corchetes].
- Falta: probar el campo Reference de Pages CMS, el contenido real (etapa 4), `.pages.yml` (etapa 5) y la guía (etapa 6).

## Stack

- Astro 7.4, salida estática, TypeScript estricto, Node 24 LTS.
- Contenido en YAML bajo `src/content/` y `src/data/site.yaml`, validado con zod en `src/content.config.ts`.
- Editor: Pages CMS (`.pages.yml`), con etiquetas en español.
- Deploy: GitHub Actions a GitHub Pages. `site` y `base` se configuran en un solo lugar.
- Sin Tailwind, sin React, sin Dependabot. Casi nada de JS en el navegador: el botón del abstract y el de copiar. Sin JS, los abstracts se ven siempre.

## Reglas que no se discuten

- Sin pull requests. Se trabaja en `develop` (se valida, no se publica); `main` es lo que está online. El build es la compuerta: `npm test` (tipos, esquemas, build y links) tiene que pasar.
- Antes de cada push, Juani revisa con `npm run dev`. No hagas push ni toques la cuenta de GitHub de Pablo sin que te lo pidan.
- Antes de cada etapa, decí qué archivos vas a crear o cambiar y esperá el OK. Al terminar, mostrá el resultado de las pruebas tal cual, aunque fallen.
- Un campo opcional vacío no se muestra. Excepción: un paper sin coautores dice "Solo-authored".
- Una sección sin contenido no aparece en el menú ni genera página.
- Los errores de contenido tienen que decir qué archivo y qué campo arreglar, en palabras que entienda Pablo.
- Nada de Google Scholar. Los links del perfil son una lista libre (etiqueta + URL).
- Los adjuntos de un paper son un link, un PDF de hasta 95 MB o los dos. GitHub bloquea archivos de más de 100 MB.
- Accesibilidad y rendimiento: HTML semántico, teclado, contraste de 4.5 a 1, Lighthouse 95 o más.
- El precio del trabajo no aparece en ningún archivo ni documento que vea Pablo.

## Contenido que edita Pablo

| Carpeta o archivo | Qué es |
| --- | --- |
| `src/content/papers/` | Un YAML por paper. `section` apunta a una subsección de Research |
| `src/content/research-sections/` | Subsecciones de Research (JMP, Working Papers, Publications, Work in Progress y las que cree él) |
| `src/content/teaching/` | Cursos |
| `src/content/software/` | Paquetes de R |
| `src/content/sections/` | Secciones extra que crea Pablo (por ejemplo Presentations) |
| `src/data/site.yaml` | Nombre, cargo, universidad, descripción para buscadores, bio y links |
| `src/assets/photo.jpg`, `public/cv.pdf`, `public/files/` | Foto, CV y PDFs adjuntos. Sin foto se ve un recuadro gris; sin CV no aparece el link |

Si el pedido es de contenido (agregar un paper, cambiar la bio), editá solo esos archivos y no toques el código.
