-- Migración aditiva para asociar noticias a disciplinas e incorporar integrantes.
-- Aplicar una sola vez en bases existentes:
-- turso db shell <nombre> < prisma/migrate-sports-members.sql

ALTER TABLE "News" ADD COLUMN "discipline" TEXT;

CREATE INDEX "News_discipline_published_publishedAt_idx"
ON "News"("discipline", "published", "publishedAt");

CREATE TABLE "SportMember" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "sport" TEXT NOT NULL,
  "imageUrl" TEXT,
  "details" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE INDEX "SportMember_sport_role_idx" ON "SportMember"("sport", "role");
