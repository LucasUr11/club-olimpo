import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// Configuración del CLI de Prisma ORM v7.
// La conexión en runtime de la aplicación se hace directo a Turso
// con @prisma/adapter-libsql (ver server/db.ts).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'] ?? '',
  },
})
