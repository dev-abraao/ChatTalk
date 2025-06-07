/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ALTER COLUMN "image_url" DROP NOT NULL,
ALTER COLUMN "image_url" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "ably_key" TEXT,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
