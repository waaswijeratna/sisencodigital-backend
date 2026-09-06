/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Username` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Username` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Username" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Username_email_key" ON "Username"("email");
