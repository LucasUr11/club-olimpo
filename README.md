# Club Atlético Olimpo — Portal Institucional

Portal web institucional del Club Atlético Olimpo Asociación Mutual (Laborde, Córdoba, Argentina), con API propia y panel de administración.

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
cp .env.example .env    # Windows: Copy-Item .env.example .env
npm run dev
```

El portal arranca en `http://localhost:5173`. **No hace falta configurar la base de datos para ver el sitio**: si Turso no está configurado o está vacío, la API responde con los datos de demostración de `shared/fixtures.ts` y el header `x-data-source: fixtures` lo indica.

## Variables de entorno

`.env` está gitignorado. `.env.example` documenta todas las variables:

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `DATABASE_URL` | Para usar la DB | URL libSQL de Turso (`turso db show <nombre> --url`) |
| `TURSO_AUTH_TOKEN` | Para usar la DB | Token de acceso (`turso db tokens create <nombre>`) |
| `ADMIN_PASSWORD` | Para el panel | Contraseña del login. Sin ella la API responde `503 admin_not_configured` |
| `SESSION_SECRET` | Recomendada | Secreto HMAC para firmar sesiones. Si falta, se deriva de `ADMIN_PASSWORD` |
| `ADMIN_SESSION_HOURS` | No | Duración de la sesión en horas (1–720). Por defecto `12` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Para subir imágenes | Cloud name de Cloudinary (público) |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Para subir imágenes | Upload preset **unsigned** de Cloudinary (público) |

Las variables `VITE_*` se compilan dentro del bundle del navegador: son públicas por diseño y **no deben contener secretos**. Si no están definidas, el panel igual permite pegar la URL de una imagen alojada en cualquier proveedor.

Generá un secreto con:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

## Configuración de Turso

1. Creá una base y obtené las credenciales:

   ```bash
   turso db create olimpo
   turso db tokens olimpo
   ```

2. Copiá los valores en `.env`:

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

# Panel de administración

El panel está implementado de punta a punta: backend (Fase 1) e interfaz visual (Fase 2). Permite gestionar partidos, noticias, patrocinadores y productos sin tocar código, y guarda todo en Turso.

## Acceso al panel

1. Levantá el proyecto con `npm run dev`.
2. Abrí `http://localhost:5173/admin`.
3. Ingresá la contraseña definida en `ADMIN_PASSWORD` (`.env`).

La sesión se guarda en `sessionStorage` (se pierde al cerrar la pestaña) y se revalida contra `GET /api/auth/session` al entrar. Si el token vence, se revoca o la API responde `401`, el panel limpia la sesión y vuelve al login automáticamente. El botón **Salir** revoca el token en el servidor y descarta la sesión local.

## Interfaz del panel (Fase 2)

### Ruta y diseño

- `/admin` se resuelve en el cliente (`src/App.tsx`); el panel se carga como **chunk separado** con `React.lazy`, así el sitio público no descarga su código.
- Diseño **Mobile First** con Tailwind CSS 4 y la paleta institucional: azul `#212062`, amarillo `#FBD800` y blanco hueso.
- Cabecera con escudo, acceso directo a **Ver sitio** y cierre de sesión; pestañas horizontales con scroll en mobile.

### Secciones y operaciones

| Pestaña | Listado | Formulario |
| --- | --- | --- |
| **Partidos** | Tarjetas con disciplina, rival, fecha/hora, cancha, estado y marcador | Disciplina, equipo, rival, localía, fecha/hora, competencia, estadio, estado y goles |
| **Noticias** | Portada, categoría, estado (publicada/borrador) y fecha | Título, slug, bajada, cuerpo, categoría, fecha, imagen y publicación |
| **Sponsors** | Logo, categoría, orden y sitio web | Nombre, categoría, URL, logo y orden |
| **Productos** | Imagen, precio, categoría y estado (disponible/agotado) | Nombre, slug, descripción, precio, moneda, categoría, imagen, destacado y disponibilidad |

Cada sección incluye:

- Botón **Nuevo** y acciones **Editar** / **Eliminar** por elemento.
- Confirmación antes de borrar (acción irreversible).
- Estado vacío con llamada a la acción, skeleton de carga y botón de reintento si falla la API.
- Conteo de elementos y descripción de qué se publica en el sitio.

### Formularios y validación

- Los formularios reutilizan `shared/validation.ts`, la **misma validación que aplica la API**: no hay reglas duplicadas ni mensajes distintos entre cliente y servidor.
- Los errores se muestran por campo y, si el error no corresponde a un campo (por ejemplo un `409` por slug duplicado), aparece un aviso general.
- Las fechas usan `<input type="datetime-local">` y se convierten a ISO-8601 antes de enviar, respetando la zona horaria del navegador.
- Noticias y productos incluyen un botón para **generar el slug** desde el título o nombre (minúsculas, números y guiones).
- Los partidos finalizados pueden guardar marcador; las noticias pueden quedar como **borrador** (`published: false`) y los productos como **agotados** (`available: false`), sin desaparecer del panel.

### Imágenes: subida y URL

El widget de imagen (`src/admin/components/ImageField.tsx`) permite:

1. **Arrastrar y soltar** un archivo o elegirlo con el selector.
2. Subirlo directo al proveedor configurado (Cloudinary con upload preset *unsigned*).
3. Ver la vista previa y editar/pegar manualmente la URL final.
4. Quitar la imagen (`null`).

Reglas y comportamiento:

- Validación en el cliente: solo imágenes y **máximo 5 MB**.
- Se envía a la API **solo la URL resultante** (`secure_url`), nunca el archivo binario.
- La API vuelve a validar la URL (`http(s)://` o ruta local `/...`) antes de guardarla en Turso.
- Sin `VITE_CLOUDINARY_*` configurado, el panel sigue funcionando: se puede pegar la URL de una imagen alojada en cualquier proveedor (S3, R2, Supabase, etc.).

Para habilitar la subida directa:

1. Creá una cuenta en [Cloudinary](https://cloudinary.com/).
2. En **Settings → Upload → Upload presets**, creá un preset **Unsigned** y restringilo (carpeta, formatos, tamaño máximo).
3. Completá `.env`:

   ```bash
   VITE_CLOUDINARY_CLOUD_NAME="tu-cloud"
   VITE_CLOUDINARY_UPLOAD_PRESET="olimpo-admin"
   ```

4. Reiniciá `npm run dev` (Vite solo lee `VITE_*` al arrancar).

El cloud name y el preset unsigned son públicos por diseño. Las restricciones reales deben configurarse en Cloudinary.

### Feedback y actualización del sitio

- **Toasts** de éxito/error accesibles (`aria-live`) que se cierran solos a los 5 segundos.
- Botones con estado *Guardando…* / *Eliminando…* para evitar dobles envíos.
- Después de cada alta, edición o borrado, el listado se recarga y el portal público consulta la API al cargar; el enlace **Ver sitio** hace una navegación completa para traer los datos frescos.
- Las lecturas públicas siguen teniendo fallback a fixtures: si Turso no responde, el sitio no queda vacío. Las escrituras, en cambio, nunca simulan éxito (`503`/`504`).

### Archivos del panel

```
src/admin/AdminPage.tsx          puerta de autenticación y estado de sesión
src/admin/AdminLogin.tsx         formulario de acceso
src/admin/AdminShell.tsx         cabecera, pestañas y layout
src/admin/feedback.tsx           toasts (contexto + aria-live)
src/admin/formUtils.ts           fechas, slug y mapeo de errores de API
src/admin/useAdminResource.ts    carga/recarga de colecciones con estado
src/admin/sections/              Matches, News, Sponsors y Products
src/admin/components/            modal, campos, imagen, confirmación, estados
src/lib/adminApi.ts              cliente autenticado (token + errores tipados)
src/lib/imageUpload.ts           subida directa a Cloudinary (unsigned)
```

### Despliegue de la ruta `/admin`

El panel es una SPA: el hosting debe reescribir `/admin` (y cualquier ruta del cliente) hacia `index.html`. Vite `dev` y `preview` ya lo hacen. En un hosting estático (Netlify, Vercel, Cloudflare Pages) configurá el fallback SPA; en Nginx, `try_files $uri /index.html`.

## API del panel (Fase 1)

### Autenticación

El login valida `ADMIN_PASSWORD` con comparación en tiempo constante y devuelve un **token de sesión firmado con HMAC-SHA256**. El servidor no guarda sesiones en la base:

- Formato del token: `v1.<expiración>.<nonce>.<firma>`. La firma cubre versión, expiración y nonce.
- Expiración configurable con `ADMIN_SESSION_HOURS` (12 h por defecto).
- El logout revoca el token en memoria hasta su expiración (best-effort). Reiniciar el proceso limpia la lista de revocados, pero los tokens siguen vencidos por firma.
- Los intentos fallidos se limitan por IP: **5 fallos en 10 minutos** → `429 too_many_attempts` con header `Retry-After`. El contador se limpia al iniciar sesión correctamente.

### `POST /api/auth/login`

```bash
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"TU_CONTRASEÑA"}'
```

```json
{
  "data": {
    "token": "v1.1792502400.Xy...<nonce>.<firma>",
    "tokenType": "Bearer",
    "expiresAt": "2026-10-23T02:00:00.000Z"
  }
}
```

Todas las rutas `/api/admin/*` requieren el header:

```
Authorization: Bearer <token>
```

### `GET /api/auth/session`

Valida el token y devuelve `{ "data": { "valid": true, "expiresAt": "..." } }`. Útil para que el panel sepa si debe mostrar el login.

### `POST /api/auth/logout`

Revoca el token recibido. Es idempotente: responde `200` aunque el token ya haya expirado.

### Endpoints CRUD

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/admin/matches` | Todos los partidos (incluye finalizados y aplazados) |
| `POST` | `/api/admin/matches` | Crea un partido |
| `PATCH` | `/api/admin/matches/:id` | Edita campos parciales |
| `DELETE` | `/api/admin/matches/:id` | Elimina un partido |
| `GET` | `/api/admin/news` | Todas las noticias (incluye borradores) |
| `POST` | `/api/admin/news` | Crea una noticia |
| `PATCH` | `/api/admin/news/:id` | Edita campos parciales |
| `DELETE` | `/api/admin/news/:id` | Elimina una noticia |
| `GET` | `/api/admin/sponsors` | Todos los sponsors |
| `POST` | `/api/admin/sponsors` | Crea un sponsor |
| `PATCH` | `/api/admin/sponsors/:id` | Edita campos parciales |
| `DELETE` | `/api/admin/sponsors/:id` | Elimina un sponsor |
| `GET` | `/api/admin/products` | Todos los productos (incluye no disponibles) |
| `POST` | `/api/admin/products` | Crea un producto |
| `PATCH` | `/api/admin/products/:id` | Edita campos parciales |
| `DELETE` | `/api/admin/products/:id` | Elimina un producto |

Las respuestas de escritura usan el mismo sobre que las lecturas: `{ data, source: "db" }`, con header `x-data-source: db`. Los errores usan `{ error: { code, message, details? } }`.

### Campos por recurso

**Partidos** (`matches`)

| Campo | Tipo | Obligatorio | Default |
| --- | --- | --- | --- |
| `discipline` | `futbol \| futbol-femenino \| basquet \| voley \| hockey` | Sí | — |
| `team` | string (100) | Sí | — |
| `opponent` | string (120) | Sí | — |
| `kickoff` | ISO-8601 | Sí | — |
| `competition` | string (160) | Sí | — |
| `isHome` | boolean | No | `true` |
| `venue` | string \| null (160) | No | `null` |
| `status` | `scheduled \| finished \| postponed` | No | `scheduled` |
| `homeScore` / `awayScore` | entero \| null (0–999) | No | `null` |

**Noticias** (`news`)

| Campo | Tipo | Obligatorio | Default |
| --- | --- | --- | --- |
| `title` | string (160) | Sí | — |
| `slug` | minúsculas, números y guiones (120), único | Sí | — |
| `excerpt` | string (500) | Sí | — |
| `category` | `primera \| inferiores \| obras \| institucional` | No | `institucional` |
| `body` | string \| null (20 000) | No | `null` |
| `coverUrl` | URL de imagen \| null | No | `null` |
| `published` | boolean | No | `true` |
| `publishedAt` | ISO-8601 \| null | No | ahora |

**Sponsors** (`sponsors`)

| Campo | Tipo | Obligatorio | Default |
| --- | --- | --- | --- |
| `name` | string (120) | Sí | — |
| `tier` | `principal \| oficial \| colaborador` | No | `oficial` |
| `url` | URL \| null | No | `null` |
| `logoUrl` | URL de imagen \| null | No | `null` |
| `order` | entero (0–9999) | No | `0` |

**Productos** (`products`)

| Campo | Tipo | Obligatorio | Default |
| --- | --- | --- | --- |
| `name` | string (120) | Sí | — |
| `slug` | minúsculas, números y guiones (120), único | Sí | — |
| `description` | string (3000) | Sí | — |
| `price` | entero (0–100 000 000) | Sí | — |
| `currency` | código ISO de 3 letras | No | `ARS` |
| `category` | string (60) | Sí | — |
| `imageUrl` | URL de imagen \| null | No | `null` |
| `featured` | boolean | No | `false` |
| `available` | boolean | No | `true` |

En `PATCH` solo se validan y actualizan los campos enviados; enviar un objeto vacío devuelve `400`.

### Ejemplo: crear una noticia con imagen en la nube

```bash
TOKEN="<token devuelto por /api/auth/login>"

curl -X POST http://localhost:5173/api/admin/news \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nuevo vestuario para las inferiores",
    "slug": "nuevo-vestuario-inferiores",
    "excerpt": "La obra se inauguró con la presencia de socios y familias.",
    "category": "obras",
    "coverUrl": "https://res.cloudinary.com/mi-club/image/upload/v1/notas/vestuario.webp",
    "published": true
  }'
```

Editar y eliminar:

```bash
curl -X PATCH http://localhost:5173/api/admin/news/<id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"published": false, "coverUrl": "https://cdn.mi-club.com/notas/vestuario-2.webp"}'

curl -X DELETE http://localhost:5173/api/admin/news/<id> \
  -H "Authorization: Bearer $TOKEN"
```

## Imágenes en la nube

El almacenamiento de archivos queda fuera de la API: el proveedor (Cloudinary, S3, R2, Supabase Storage, etc.) recibe el archivo y devuelve una URL pública. El panel sube el archivo desde el navegador y guarda **solo el string de la URL**; la API no recibe archivos binarios.

| Recurso | Campo en la base | Campo en la API |
| --- | --- | --- |
| Noticias | `News.coverUrl` | `coverUrl` |
| Sponsors | `Sponsor.logoUrl` | `logoUrl` |
| Productos | `Product.imageUrl` | `imageUrl` |

Reglas de validación (`shared/validation.ts` → `optionalUrl`):

- Acepta URLs absolutas `http://` o `https://` (máx. 2048 caracteres).
- Acepta rutas locales que empiecen con `/` (útil para assets en `public/` durante el desarrollo).
- Rechaza esquemas peligrosos como `javascript:` y `data:`.
- `null` o `""` limpian el campo.

## Códigos de error

| Status | `code` | Cuándo |
| --- | --- | --- |
| 400 | `validation_error` | Payload inválido; `details` trae un mensaje por campo |
| 400 | `invalid_json` / `invalid_payload` / `invalid_id` | JSON roto, body vacío o id mal codificado |
| 401 | `invalid_credentials` | Contraseña incorrecta |
| 401 | `unauthorized` | Falta el token, es inválido o expiró |
| 404 | `not_found` | Recurso o registro inexistente |
| 405 | `method_not_allowed` | Método no soportado para esa ruta |
| 409 | `conflict` | Slug duplicado u otra restricción única |
| 413 | `payload_too_large` | Body mayor a 256 KB |
| 429 | `too_many_attempts` | 5 intentos fallidos de login en 10 minutos |
| 503 | `admin_not_configured` | Falta `ADMIN_PASSWORD` |
| 503 | `db_unavailable` | Turso no configurado o inaccesible |
| 504 | `db_timeout` | La base tardó más de 4 s |

## Fallback a fixtures y escrituras

- **Lecturas públicas** (`/api/matches`, `/api/news`, etc.): consultan Turso con timeout de 4 s; si la base no está configurada, falla o la tabla está vacía, responden fixtures. El sitio nunca se ve vacío.
- **Lecturas de administración / escrituras** (`/api/admin/*`): **no** caen a fixtures. Si Turso no está disponible responden `503`/`504` para no simular un guardado que en realidad no ocurrió.
- Los listados públicos filtran (`published: true`, `available: true`, partidos futuros); los listados de `/api/admin/*` muestran todo para poder editar borradores y productos ocultos.

## Seguridad

- `ADMIN_PASSWORD` y `SESSION_SECRET` viven solo en `.env` (nunca en el bundle del cliente).
- La contraseña se compara con hash + `timingSafeEqual`.
- El token se envía en `Authorization`, nunca en la URL, y el panel lo guarda en `sessionStorage` (se borra al cerrar la pestaña o al recibir un `401`). Si se migra a cookies, usar `HttpOnly`, `Secure` y `SameSite=Strict`.
- El upload preset de Cloudinary es *unsigned* y por eso público: restringilo en el dashboard (carpeta, formatos, tamaño) y revisá periódicamente su uso. Para un control más estricto, reemplazá la subida directa por un endpoint propio con firma.
- El límite de intentos y la revocación de tokens son **en memoria**: alcanzan para una instancia. Con varias instancias hacen falta Redis o una tabla de sesiones en Turso.
- En producción, serví todo por HTTPS y usá una contraseña larga y única (gestor de contraseñas).
- Este backend corre dentro del proceso de Vite (`dev`/`preview`). Para un despliegue con otro hosting habrá que extraer los handlers de `server/api.ts` a un adaptador (Node, serverless, etc.); la lógica de auth, validación y repositorios ya está desacoplada.

## Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` | Dev server con API en `/api/*` |
| `npm run build` | Typecheck + build de producción (`dist/`) |
| `npm run preview` | Vista previa del build (incluye la API) |
| `npm run db:generate` | Regenera el Prisma Client |
| `npm run db:schema:sql` | Deriva `prisma/schema.sql` desde el schema |
| `npm run db:seed` | Inserta los datos de demostración en Turso |

## Arquitectura

```
prisma/schema.prisma     modelos (Match, News, Achievement, Sponsor, HistoryMilestone, Product)
generated/prisma/        Prisma Client generado (gitignorado)
shared/types.ts          DTOs compartidos + payloads de escritura
shared/validation.ts     validación de payloads (admin) reutilizable por el frontend
shared/fixtures.ts       datos de demostración (fallback y seed)
server/db.ts             cliente Prisma singleton con adapter libSQL (lazy)
server/errors.ts         ApiError (status + código estable)
server/auth.ts           login, tokens HMAC, revocación y límite de intentos
server/repositories.ts   lecturas con fallback + listados y escrituras de administración
server/api.ts            plugin Vite: rutas públicas, auth y CRUD /api/admin/*
src/components/          Header, Footer, Hero, NextMatches, NewsCarousel, History,
                         Palmares, Sponsors, Shop, Streaming, íconos
src/admin/               panel: login, shell, secciones CRUD y componentes
src/hooks/useApi.ts      fetch con cache; arranca con fixtures y reemplaza al llegar la respuesta
src/lib/api.ts           cliente HTTP tipado del sitio público
src/lib/adminApi.ts      cliente autenticado del panel (token, errores, 401 global)
src/lib/imageUpload.ts   subida directa de imágenes a Cloudinary (unsigned)
```

Decisiones clave:

- **Un solo proceso:** la API vive como middleware de Vite, así no hay que levantar ni mantener un backend paralelo.
- **El sitio nunca se vacía:** las lecturas públicas son `{ data, source }`; el frontend pinta fixtures mientras llega la respuesta real.
- **Escrituras honestas:** sin base disponible, el panel recibe un error explícito en vez de un falso éxito.
- **Prisma 7:** la URL de la base vive en `prisma.config.ts` (no en el schema), y el cliente generado se importa desde `generated/prisma/client`.
- **Validación compartida:** `shared/validation.ts` es la única fuente de verdad; los formularios del panel la reutilizan antes de enviar y la API la aplica como control final.

## Contenido editable

Los datos de `shared/fixtures.ts` son material de demostración basado en la historia real del club (fundación el 30/08/1911, 16 títulos de la Liga Beccar Varela, Campeón Provincial 2020, etc.):

- **Palmarés:** los ítems de fútbol son los títulos oficiales; los de otras disciplinas son marcadores de diseño y deben completarse con datos verificados.
- **`siteLinks`:** las URLs de Shop, Streaming y redes sociales son placeholders (`#`) a reemplazar por los links reales del club.
- **Patrocinadores, productos y noticias:** textos de ejemplo listos para sustituir por contenido real desde el panel.
- **Imágenes:** las columnas `coverUrl`, `logoUrl` e `imageUrl` ya existen en la base; se completan desde el panel con la URL que devuelva el proveedor de almacenamiento.
