// ============================================================================
// Seed: puebla Turso con los fixtures iniciales del portal.
// ----------------------------------------------------------------------------
// Uso:   npm run db:seed
// Requiere DATABASE_URL y TURSO_AUTH_TOKEN válidos en .env.
// El proceso es idempotente: borra y reinserta los registros de demostración.
// ============================================================================

import 'dotenv/config'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '../generated/prisma/client'
import { fixtures } from '../shared/fixtures'

async function main(): Promise<void> {
  const url = process.env['DATABASE_URL']
  if (!url) {
    throw new Error('Falta DATABASE_URL en .env — configurá las credenciales de Turso.')
  }

  const adapter = new PrismaLibSql({ url, authToken: process.env['TURSO_AUTH_TOKEN'] })
  const prisma = new PrismaClient({ adapter })

  try {
    // 1) Partidos -----------------------------------------------------------
    await prisma.match.deleteMany()
    await prisma.match.createMany({
      data: fixtures.matches.map((match) => ({
        ...match,
        kickoff: new Date(match.kickoff),
      })),
    })

    // 2) Noticias -----------------------------------------------------------
    await prisma.news.deleteMany()
    await prisma.news.createMany({
      data: fixtures.news.map((item) => ({
        ...item,
        publishedAt: new Date(item.publishedAt),
      })),
    })

    // 3) Integrantes de disciplinas --------------------------------------
    await prisma.sportMember.deleteMany()
    if (fixtures.sportMembers.length > 0) {
      await prisma.sportMember.createMany({ data: fixtures.sportMembers })
    }

    // 4) Palmarés -----------------------------------------------------------
    await prisma.achievement.deleteMany()
    await prisma.achievement.createMany({
      data: fixtures.achievements.map((item, index) => ({ ...item, order: index })),
    })

    // 5) Sponsors -----------------------------------------------------------
    await prisma.sponsor.deleteMany()
    await prisma.sponsor.createMany({
      data: fixtures.sponsors.map((item, index) => ({ ...item, order: index })),
    })

    // 6) Historia -----------------------------------------------------------
    await prisma.historyMilestone.deleteMany()
    await prisma.historyMilestone.createMany({
      data: fixtures.history.map((item, index) => ({ ...item, order: index })),
    })

    // 7) Tienda ------------------------------------------------------------
    await prisma.product.deleteMany()
    await prisma.product.createMany({ data: fixtures.products })

    console.log('✔ Base de datos poblada con los fixtures:')
    console.log(`   • Partidos:      ${fixtures.matches.length}`)
    console.log(`   • Noticias:      ${fixtures.news.length}`)
    console.log(`   • Integrantes:   ${fixtures.sportMembers.length}`)
    console.log(`   • Logros:        ${fixtures.achievements.length}`)
    console.log(`   • Sponsors:      ${fixtures.sponsors.length}`)
    console.log(`   • Hitos:         ${fixtures.history.length}`)
    console.log(`   • Productos:     ${fixtures.products.length}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error: unknown) => {
  console.error('✗ Error poblando la base de datos:', error)
  process.exitCode = 1
})
