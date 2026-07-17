-- CreateEnum
CREATE TYPE "ShippingMethodType" AS ENUM ('FLAT_RATE', 'FREE_SHIPPING', 'LOCAL_PICKUP');

-- AlterTable (products: shipping class)
ALTER TABLE "products" ADD COLUMN "shippingClassId" TEXT;

-- AlterTable (orders: shipping snapshot)
ALTER TABLE "orders" ADD COLUMN "shippingRegion" TEXT;
ALTER TABLE "orders" ADD COLUMN "shippingMethod" TEXT;
ALTER TABLE "orders" ADD COLUMN "shippingCost" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "shipping_zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regions" TEXT[],
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_methods" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "type" "ShippingMethodType" NOT NULL DEFAULT 'FLAT_RATE',
    "title" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minAmount" DOUBLE PRECISION,
    "requiresCoupon" BOOLEAN NOT NULL DEFAULT false,
    "classCosts" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipping_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipping_classes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_shippingClassId_idx" ON "products"("shippingClassId");

-- CreateIndex
CREATE INDEX "shipping_methods_zoneId_idx" ON "shipping_methods"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_classes_slug_key" ON "shipping_classes"("slug");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_shippingClassId_fkey" FOREIGN KEY ("shippingClassId") REFERENCES "shipping_classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_methods" ADD CONSTRAINT "shipping_methods_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "shipping_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
