-- CreateEnum
CREATE TYPE "OrderState" AS ENUM ('CURRENT', 'ARCHIVED', 'TRASHED');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELED', 'ABANDONED');
ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropIndex
DROP INDEX "orders_number_key";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "number",
ADD COLUMN     "seq" INTEGER NOT NULL,
ADD COLUMN     "state" "OrderState" NOT NULL DEFAULT 'CURRENT';

-- CreateIndex
CREATE UNIQUE INDEX "orders_seq_key" ON "orders"("seq");

