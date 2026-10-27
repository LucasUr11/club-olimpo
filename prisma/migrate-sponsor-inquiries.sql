-- Migración aditiva para almacenar consultas de empresas interesadas en patrocinar.
-- Aplicar una sola vez en bases existentes:
-- turso db shell <nombre> < prisma/migrate-sponsor-inquiries.sql

CREATE TABLE "SponsorInquiry" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "companyName" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "SponsorInquiry_createdAt_idx" ON "SponsorInquiry"("createdAt");
