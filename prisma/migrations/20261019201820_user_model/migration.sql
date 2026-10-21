/*
  Warnings:

  - You are about to drop the column `privilages` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "privilages",
ADD COLUMN     "privileges" TEXT[] DEFAULT ARRAY[]::TEXT[];
