/*
  Warnings:

  - A unique constraint covering the columns `[image_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[image_id]` on the table `inventory_items` will be added. If there are existing duplicate values, this will fail.
  - Made the column `url` on table `Image` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Image" ALTER COLUMN "url" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_image_id_key" ON "User"("image_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_image_id_key" ON "inventory_items"("image_id");
