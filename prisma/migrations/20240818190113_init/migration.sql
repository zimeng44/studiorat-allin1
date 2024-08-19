/*
  Warnings:

  - The primary key for the `Authenticator` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `academic_level` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `net_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stu_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `checkout_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `creation_time` on the `checkout_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `finish_monitor` on the `checkout_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `finish_time` on the `checkout_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `no_tag_items` on the `checkout_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `other_location` on the `checkout_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `checkout_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `bookingsId` on the `inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `checkout_sessionsId` on the `inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `inventory_reportsId` on the `inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `inventory_reports` table. All the data in the column will be lost.
  - You are about to drop the column `created_by_id` on the `roster_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `rostersId` on the `roster_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by_id` on the `roster_permissions` table. All the data in the column will be lost.
  - The `permitted_studios` column on the `roster_permissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `created_by_id` on the `rosters` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by_id` on the `rosters` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stuId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[netId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[permission_code]` on the table `roster_permissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stu_n]` on the table `rosters` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `user_role` will be added. If there are existing duplicate values, this will fail.
  - Made the column `created_by_id` on table `inventory_reports` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Authenticator" DROP CONSTRAINT "Authenticator_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_userId_fkey";

-- DropForeignKey
ALTER TABLE "checkout_sessions" DROP CONSTRAINT "checkout_sessions_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "checkout_sessions" DROP CONSTRAINT "checkout_sessions_userId_fkey";

-- DropForeignKey
ALTER TABLE "inventory_items" DROP CONSTRAINT "inventory_items_bookingsId_fkey";

-- DropForeignKey
ALTER TABLE "inventory_items" DROP CONSTRAINT "inventory_items_checkout_sessionsId_fkey";

-- DropForeignKey
ALTER TABLE "inventory_items" DROP CONSTRAINT "inventory_items_inventory_reportsId_fkey";

-- DropForeignKey
ALTER TABLE "inventory_reports" DROP CONSTRAINT "inventory_reports_userId_fkey";

-- DropForeignKey
ALTER TABLE "roster_permissions" DROP CONSTRAINT "roster_permissions_rostersId_fkey";

-- DropIndex
DROP INDEX "roster_permissions_created_by_id_fk";

-- DropIndex
DROP INDEX "roster_permissions_updated_by_id_fk";

-- DropIndex
DROP INDEX "rosters_created_by_id_fk";

-- DropIndex
DROP INDEX "rosters_updated_by_id_fk";

-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Authenticator" DROP CONSTRAINT "Authenticator_pkey",
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("userId", "credentialID");

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "academic_level",
DROP COLUMN "created_at",
DROP COLUMN "first_name",
DROP COLUMN "last_name",
DROP COLUMN "net_id",
DROP COLUMN "stu_id",
DROP COLUMN "updated_at",
ADD COLUMN     "academicLevel" VARCHAR(255),
ADD COLUMN     "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "firstName" VARCHAR(255),
ADD COLUMN     "lastName" VARCHAR(255),
ADD COLUMN     "netId" VARCHAR(255),
ADD COLUMN     "stuId" VARCHAR(255),
ADD COLUMN     "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "created_by_id" SET DATA TYPE TEXT,
ALTER COLUMN "updated_by_id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "checkout_sessions" DROP COLUMN "created_at",
DROP COLUMN "creation_time",
DROP COLUMN "finish_monitor",
DROP COLUMN "finish_time",
DROP COLUMN "no_tag_items",
DROP COLUMN "other_location",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creationTime" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "finishMonitor" VARCHAR(255),
ADD COLUMN     "finishTime" TIMESTAMP(6),
ADD COLUMN     "noTagItems" TEXT[],
ADD COLUMN     "otherLocation" VARCHAR(255),
ADD COLUMN     "return_id" VARCHAR(255),
ADD COLUMN     "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "creatorId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "inventory_items" DROP COLUMN "bookingsId",
DROP COLUMN "checkout_sessionsId",
DROP COLUMN "inventory_reportsId";

-- AlterTable
ALTER TABLE "inventory_reports" DROP COLUMN "userId",
ALTER COLUMN "created_by_id" SET NOT NULL,
ALTER COLUMN "created_by_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "roster_permissions" DROP COLUMN "created_by_id",
DROP COLUMN "rostersId",
DROP COLUMN "updated_by_id",
DROP COLUMN "permitted_studios",
ADD COLUMN     "permitted_studios" TEXT[];

-- AlterTable
ALTER TABLE "rosters" DROP COLUMN "created_by_id",
DROP COLUMN "updated_by_id",
ALTER COLUMN "agreement" SET DEFAULT false,
ALTER COLUMN "excused_abs" SET DEFAULT 0,
ALTER COLUMN "excused_late" SET DEFAULT 0,
ALTER COLUMN "unexcused_abs" SET DEFAULT 0,
ALTER COLUMN "unexcused_late" SET DEFAULT 0,
ALTER COLUMN "late_return" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "_bookingsToinventory_items" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_checkout_sessionsToinventory_items" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_inventory_itemsToinventory_reports" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_roster_permissionsTorosters" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_bookingsToinventory_items_AB_unique" ON "_bookingsToinventory_items"("A", "B");

-- CreateIndex
CREATE INDEX "_bookingsToinventory_items_B_index" ON "_bookingsToinventory_items"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_checkout_sessionsToinventory_items_AB_unique" ON "_checkout_sessionsToinventory_items"("A", "B");

-- CreateIndex
CREATE INDEX "_checkout_sessionsToinventory_items_B_index" ON "_checkout_sessionsToinventory_items"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_inventory_itemsToinventory_reports_AB_unique" ON "_inventory_itemsToinventory_reports"("A", "B");

-- CreateIndex
CREATE INDEX "_inventory_itemsToinventory_reports_B_index" ON "_inventory_itemsToinventory_reports"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_roster_permissionsTorosters_AB_unique" ON "_roster_permissionsTorosters"("A", "B");

-- CreateIndex
CREATE INDEX "_roster_permissionsTorosters_B_index" ON "_roster_permissionsTorosters"("B");

-- CreateIndex
CREATE UNIQUE INDEX "User_stuId_key" ON "User"("stuId");

-- CreateIndex
CREATE UNIQUE INDEX "User_netId_key" ON "User"("netId");

-- CreateIndex
CREATE UNIQUE INDEX "roster_permissions_permission_code_key" ON "roster_permissions"("permission_code");

-- CreateIndex
CREATE INDEX "roster_permission_code_fk" ON "roster_permissions"("permission_code");

-- CreateIndex
CREATE INDEX "roster_permission_title_fk" ON "roster_permissions"("permission_title");

-- CreateIndex
CREATE UNIQUE INDEX "rosters_stu_n_key" ON "rosters"("stu_n");

-- CreateIndex
CREATE INDEX "rosters_stu_name_fk" ON "rosters"("stu_name");

-- CreateIndex
CREATE INDEX "rosters_stu_n_fk" ON "rosters"("stu_n");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_name_key" ON "user_role"("name");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authenticator" ADD CONSTRAINT "Authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_reports" ADD CONSTRAINT "inventory_reports_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_bookingsToinventory_items" ADD CONSTRAINT "_bookingsToinventory_items_A_fkey" FOREIGN KEY ("A") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_bookingsToinventory_items" ADD CONSTRAINT "_bookingsToinventory_items_B_fkey" FOREIGN KEY ("B") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_checkout_sessionsToinventory_items" ADD CONSTRAINT "_checkout_sessionsToinventory_items_A_fkey" FOREIGN KEY ("A") REFERENCES "checkout_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_checkout_sessionsToinventory_items" ADD CONSTRAINT "_checkout_sessionsToinventory_items_B_fkey" FOREIGN KEY ("B") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_inventory_itemsToinventory_reports" ADD CONSTRAINT "_inventory_itemsToinventory_reports_A_fkey" FOREIGN KEY ("A") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_inventory_itemsToinventory_reports" ADD CONSTRAINT "_inventory_itemsToinventory_reports_B_fkey" FOREIGN KEY ("B") REFERENCES "inventory_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_roster_permissionsTorosters" ADD CONSTRAINT "_roster_permissionsTorosters_A_fkey" FOREIGN KEY ("A") REFERENCES "roster_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_roster_permissionsTorosters" ADD CONSTRAINT "_roster_permissionsTorosters_B_fkey" FOREIGN KEY ("B") REFERENCES "rosters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
