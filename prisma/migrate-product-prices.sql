-- ============================================================================
-- Migración manual: precio único → precio socio / no socio
-- ----------------------------------------------------------------------------
-- Aplicar SOLO sobre bases creadas con el esquema anterior (columna "price").
--
--   turso db shell olimpo < prisma/migrate-product-prices.sql
--   npm run db:generate
--
-- La migración copia el precio anterior a ambos campos. Después se pueden
-- ajustar los precios de socios desde el panel de administración.
-- Para una base nueva, alcanza con prisma/schema.sql.
-- ============================================================================

BEGIN TRANSACTION;

CREATE TABLE "Product_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "memberPrice" INTEGER NOT NULL,
    "nonMemberPrice" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "category" TEXT NOT NULL,
    "imageUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "Product_new" (
    "id",
    "name",
    "slug",
    "description",
    "memberPrice",
    "nonMemberPrice",
    "currency",
    "category",
    "imageUrl",
    "featured",
    "available",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "name",
    "slug",
    "description",
    "price",
    "price",
    "currency",
    "category",
    "imageUrl",
    "featured",
    "available",
    "createdAt",
    "updatedAt"
FROM "Product";

DROP TABLE "Product";

ALTER TABLE "Product_new" RENAME TO "Product";

CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_featured_available_idx" ON "Product"("featured", "available");

COMMIT;
