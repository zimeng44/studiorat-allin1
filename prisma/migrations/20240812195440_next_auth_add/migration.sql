/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - Added the required column `user_roleId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "academic_level" VARCHAR(255),
ADD COLUMN     "bio" VARCHAR(255),
ADD COLUMN     "blocked" BOOLEAN DEFAULT false,
ADD COLUMN     "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "created_by_id" INTEGER,
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "first_name" VARCHAR(255),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "last_name" VARCHAR(255),
ADD COLUMN     "net_id" VARCHAR(255),
ADD COLUMN     "stu_id" VARCHAR(255),
ADD COLUMN     "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_by_id" INTEGER,
ADD COLUMN     "user_roleId" INTEGER NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255);

-- CreateTable
CREATE TABLE "Account" (
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "Authenticator" (
    "credentialID" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "credentialPublicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT,

    CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("userId","credentialID")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" SERIAL NOT NULL,
    "start_time" TIMESTAMP(6),
    "end_time" TIMESTAMP(6),
    "use_location" VARCHAR(255),
    "notes" TEXT,
    "type" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,
    "userId" INTEGER,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkout_sessions" (
    "id" SERIAL NOT NULL,
    "creation_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "other_location" VARCHAR(255),
    "finish_time" TIMESTAMP(6),
    "finish_monitor" VARCHAR(255),
    "notes" TEXT,
    "finished" BOOLEAN DEFAULT false,
    "studio" VARCHAR(255),
    "no_tag_items" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" INTEGER,
    "userId" INTEGER,
    "creatorId" INTEGER,

    CONSTRAINT "checkout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "alternative_text" VARCHAR(255),
    "caption" VARCHAR(255),
    "width" INTEGER,
    "height" INTEGER,
    "formats" JSONB,
    "hash" VARCHAR(255),
    "ext" VARCHAR(255),
    "mime" VARCHAR(255),
    "size" DECIMAL(10,2),
    "url" VARCHAR(255),
    "preview_url" VARCHAR(255),
    "provider" VARCHAR(255),
    "provider_metadata" JSONB,
    "folder_path" VARCHAR(255),
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "globals" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255),
    "description" TEXT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "published_at" TIMESTAMP(6),
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,

    CONSTRAINT "globals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "globals_components" (
    "id" SERIAL NOT NULL,
    "entity_id" INTEGER,
    "component_id" INTEGER,
    "component_type" VARCHAR(255),
    "field" VARCHAR(255),
    "order" DOUBLE PRECISION,

    CONSTRAINT "globals_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_pages" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255),
    "description" TEXT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "published_at" TIMESTAMP(6),
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,

    CONSTRAINT "home_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_pages_components" (
    "id" SERIAL NOT NULL,
    "entity_id" INTEGER,
    "component_id" INTEGER,
    "component_type" VARCHAR(255),
    "field" VARCHAR(255),
    "order" DOUBLE PRECISION,

    CONSTRAINT "home_pages_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" SERIAL NOT NULL,
    "m_tech_barcode" VARCHAR(255),
    "make" VARCHAR(255),
    "model" VARCHAR(255),
    "category" VARCHAR(255),
    "description" VARCHAR(255),
    "accessories" VARCHAR(255),
    "storage_location" VARCHAR(255),
    "comments" TEXT,
    "out" BOOLEAN DEFAULT false,
    "broken" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,
    "checkout_sessionsId" INTEGER,
    "bookingsId" INTEGER,
    "inventory_reportsId" INTEGER,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_reports" (
    "id" SERIAL NOT NULL,
    "is_finished" BOOLEAN DEFAULT false,
    "notes" TEXT,
    "inventory_size" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "inventory_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roster_permissions" (
    "id" SERIAL NOT NULL,
    "permission_code" VARCHAR(255),
    "permission_title" VARCHAR(255),
    "instructor" VARCHAR(255),
    "permission_details" TEXT,
    "permitted_studios" JSONB,
    "start_date" TIMESTAMP(6),
    "end_date" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,
    "rostersId" INTEGER,

    CONSTRAINT "roster_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rosters" (
    "id" SERIAL NOT NULL,
    "stu_n" VARCHAR(255),
    "net_id" VARCHAR(255),
    "stu_name" VARCHAR(255),
    "academic_level" VARCHAR(255),
    "academic_program" VARCHAR(255),
    "agreement" BOOLEAN,
    "excused_abs" INTEGER,
    "excused_late" INTEGER,
    "unexcused_abs" INTEGER,
    "unexcused_late" INTEGER,
    "late_return" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" INTEGER,
    "updated_by_id" INTEGER,

    CONSTRAINT "rosters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Authenticator_credentialID_key" ON "Authenticator"("credentialID");

-- CreateIndex
CREATE INDEX "bookings_created_by_id_fk" ON "bookings"("created_by_id");

-- CreateIndex
CREATE INDEX "bookings_updated_by_id_fk" ON "bookings"("updated_by_id");

-- CreateIndex
CREATE INDEX "checkout_sessions_id_idx" ON "checkout_sessions"("id");

-- CreateIndex
CREATE INDEX "files_created_by_id_fk" ON "files"("created_by_id");

-- CreateIndex
CREATE INDEX "files_updated_by_id_fk" ON "files"("updated_by_id");

-- CreateIndex
CREATE INDEX "upload_files_created_at_index" ON "files"("created_at");

-- CreateIndex
CREATE INDEX "upload_files_ext_index" ON "files"("ext");

-- CreateIndex
CREATE INDEX "upload_files_folder_path_index" ON "files"("folder_path");

-- CreateIndex
CREATE INDEX "upload_files_name_index" ON "files"("name");

-- CreateIndex
CREATE INDEX "upload_files_size_index" ON "files"("size");

-- CreateIndex
CREATE INDEX "upload_files_updated_at_index" ON "files"("updated_at");

-- CreateIndex
CREATE INDEX "globals_created_by_id_fk" ON "globals"("created_by_id");

-- CreateIndex
CREATE INDEX "globals_updated_by_id_fk" ON "globals"("updated_by_id");

-- CreateIndex
CREATE INDEX "globals_component_type_index" ON "globals_components"("component_type");

-- CreateIndex
CREATE INDEX "globals_entity_fk" ON "globals_components"("entity_id");

-- CreateIndex
CREATE INDEX "globals_field_index" ON "globals_components"("field");

-- CreateIndex
CREATE UNIQUE INDEX "globals_unique" ON "globals_components"("entity_id", "component_id", "field", "component_type");

-- CreateIndex
CREATE INDEX "home_pages_created_by_id_fk" ON "home_pages"("created_by_id");

-- CreateIndex
CREATE INDEX "home_pages_updated_by_id_fk" ON "home_pages"("updated_by_id");

-- CreateIndex
CREATE INDEX "home_pages_component_type_index" ON "home_pages_components"("component_type");

-- CreateIndex
CREATE INDEX "home_pages_entity_fk" ON "home_pages_components"("entity_id");

-- CreateIndex
CREATE INDEX "home_pages_field_index" ON "home_pages_components"("field");

-- CreateIndex
CREATE UNIQUE INDEX "home_pages_unique" ON "home_pages_components"("entity_id", "component_id", "field", "component_type");

-- CreateIndex
CREATE INDEX "inventory_items_created_by_id_fk" ON "inventory_items"("created_by_id");

-- CreateIndex
CREATE INDEX "inventory_items_updated_by_id_fk" ON "inventory_items"("updated_by_id");

-- CreateIndex
CREATE INDEX "inventory_reports_created_by_id_fk" ON "inventory_reports"("created_by_id");

-- CreateIndex
CREATE INDEX "inventory_reports_updated_by_id_fk" ON "inventory_reports"("updated_by_id");

-- CreateIndex
CREATE INDEX "roster_permissions_created_by_id_fk" ON "roster_permissions"("created_by_id");

-- CreateIndex
CREATE INDEX "roster_permissions_updated_by_id_fk" ON "roster_permissions"("updated_by_id");

-- CreateIndex
CREATE INDEX "rosters_created_by_id_fk" ON "rosters"("created_by_id");

-- CreateIndex
CREATE INDEX "rosters_updated_by_id_fk" ON "rosters"("updated_by_id");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authenticator" ADD CONSTRAINT "Authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "globals_components" ADD CONSTRAINT "globals_components_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "globals"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_pages_components" ADD CONSTRAINT "home_pages_components_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "home_pages"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_checkout_sessionsId_fkey" FOREIGN KEY ("checkout_sessionsId") REFERENCES "checkout_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_bookingsId_fkey" FOREIGN KEY ("bookingsId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_inventory_reportsId_fkey" FOREIGN KEY ("inventory_reportsId") REFERENCES "inventory_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_reports" ADD CONSTRAINT "inventory_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roster_permissions" ADD CONSTRAINT "roster_permissions_rostersId_fkey" FOREIGN KEY ("rostersId") REFERENCES "rosters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_user_roleId_fkey" FOREIGN KEY ("user_roleId") REFERENCES "user_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
