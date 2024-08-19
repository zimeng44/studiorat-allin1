/*
  Warnings:

  - The `image` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "image",
ADD COLUMN     "image" BYTEA;

-- AlterTable
ALTER TABLE "inventory_items" ADD COLUMN     "image" BYTEA;
