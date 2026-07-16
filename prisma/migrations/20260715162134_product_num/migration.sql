-- AlterTable
ALTER TABLE "products" ADD COLUMN     "num" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "products_num_key" ON "products"("num");

