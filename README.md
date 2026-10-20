# Club Atlético Olimpo — Portal Institucional

Portal web institucional del Club Atlético Olimpo Asociación Mutual (Laborde, Córdoba, Argentina).

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS 4
- **Base de datos:** Turso (SQLite en la nube) vía Prisma ORM 7 + `@prisma/adapter-libsql`
- **API:** middleware liviano dentro del propio Vite (sin servidor Express paralelo)
- **Diseño:** Mobile First, paleta institucional azul `#212062` y amarillo `#FBD800`

## Requisitos

- Node.js 20.19+ (probado con Node 22)
- [Turso CLI](https://docs.turso.tech/cli/installation) (opcional, para migraciones y seed)

## Puesta en marcha

```bash
npm install
npm run dev
```

El portal arranca en `http://localhost:5173`. **No hace falta configurar la base de datos para ver el sitio**: si Turso no está configurado o está vacío, la API responde con los datos de demostración de `shared/fixtures.ts` y el header `x-data-source: fixtures` lo indica.

## Configuración de Turso

1. Creá una base y obtené las credenciales:

   ```bash
   turso db create olimpo
   turso db tokens olimpo
   ```

2. Copiá los valores en `.env` (está gitignorado) usando `.env.example` como referencia:

   ```bash
   DATABASE_URL="libsql://TU-BASE.turso.io"
   TURSO_AUTH_TOKEN="eyJ..."
   ```

3. Generá el esquema en la nube:

   ```bash
   npm run db:schema:sql        # genera schema.sql desde schema.prisma
   turso db shell olimpo < prisma/schema.sql
   ```

4. Cargá los datos iniciales:

   ```bash
   npm run db:seed
   ```

Cuando la base esté configurada y tenga filas, la API sirve datos reales (`x-data-source: db`). Si la query falla (p. ej. token inválido), vuelve a fixtures en lugar de romper el sitio.

## Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` | Dev server con API en `/api/*` |
| `npm run build` | Typecheck + build de producción (`dist/`) |
| `npm run preview` | Vista previa del build |
| `npm run db:generate` | Regenera el Prisma Client |
| `npm run db:schema:sql` | Deriva `prisma/schema.sql` desde el schema |
| `npm run db:seed` | Inserta los datos de demostración en Turso |

## Arquitectura

```
prisma/schema.prisma     modelos (Match, News, Achievement, Sponsor, HistoryMilestone, Product)
generated/prisma/        Prisma Client generado (gitignorado)
shared/types.ts          DTOs compartidos servidor ↔ cliente + validadores
shared/fixtures.ts       datos de demostración (fallback y seed)
server/db.ts             cliente Prisma singleton con adapter libsql (lazy)
server/repositories.ts   lecturas con timeout + fallback a fixtures
server/api.ts            plugin Vite: middleware /api/health|matches|news|...
src/components/          Header, Footer, Hero, NextMatches, NewsCarousel, History,
                         Palmares, Sponsors, Shop, Streaming, íconos
src/hooks/useApi.ts      fetch con cache; arranca con fixtures y reemplaza al llegar la respuesta
src/lib/api.ts           cliente HTTP tipado
```

Decisiones clave:

- **Un solo proceso:** la API vive como middleware de Vite, así no hay que levantar ni mantener un backend paralelo.
- **El sitio nunca se vacía:** toda respuesta de API es `{ data, source }`; el frontend pinta fixtures mientras llega la respuesta real.
- **Prisma 7:** la URL de la base vive en `prisma.config.ts` (no en el schema), y el cliente generado se importa desde `generated/prisma/client`.

## Contenido editable

Los datos de `shared/fixtures.ts` son material de demostración basado en la historia real del club (fundación el 30/08/1911, 16 títulos de la Liga Beccar Varela, Campeón Provincial 2020, etc.):

- **Palmarés:** los ítems de fútbol son los títulos oficiales; los de otras disciplinas son marcadores de diseño y deben completarse con datos verificados.
- **`siteLinks`:** las URLs de Shop, Streaming y redes sociales son placeholders (`#`) a reemplazar por los links reales del club.
- **Patrocinadores, productos y noticias:** textos de ejemplo listos para sustituir por contenido real.
