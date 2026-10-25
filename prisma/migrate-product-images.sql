-- ============================================================================
-- Migración aditiva: galería de imágenes para productos.
-- ----------------------------------------------------------------------------
-- Aplicar una sola vez sobre una base existente que ya tenga el esquema actual:
--
--   turso db shell olimpo < prisma/migrate-product-images.sql
--   npm run db:generate
--
-- Las URLs existentes en "imageUrl" se conservan; la aplicación las presenta
-- como la primera imagen cuando "imageUrls" todavía está vacío.
-- Para una base nueva, alcanza con prisma/schema.sql.
-- ============================================================================

ALTER TABLE "Product"
ADD COLUMN "imageUrls" TEXT NOT NULL DEFAULT '[]';
