# pablomones.github.io

Personal academic website of Pablo Mones. Built with [Astro](https://astro.build), published on GitHub Pages.

## Desarrollo

Requiere Node 24 (está en `.nvmrc`).

```sh
npm ci          # instala las dependencias exactas del lockfile
npm run dev     # web local en http://localhost:4321
npm test        # tipos + contenido, build y links internos
```

| Comando | Qué hace |
| --- | --- |
| `npm run check` | Tipos de TypeScript y esquemas del contenido |
| `npm run build` | Compila la web en `dist/` |
| `npm run links` | Revisa los links internos y las anclas de `dist/` |
| `npm run preview` | Sirve `dist/` para revisarla como queda publicada |

## Ramas

- `develop`: trabajo en curso. Cada push se valida en GitHub Actions y no se publica.
- `main`: lo que está online. Cada push valida y publica en GitHub Pages.

## Contenido

Todo el contenido está en YAML, en `src/content/` y `src/data/site.yaml`. Lo que está entre [corchetes] falta completarlo. El modelo de contenido y las decisiones están en [docs/PLAN.md](docs/PLAN.md).

## Créditos

- Ícono de la pestaña: corona de Columbia, de [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Columbia_College_of_Columbia_University_Crown_2020.svg) (CC BY-SA 4.0), recortada sin el "1754". La marca es de Columbia University.
