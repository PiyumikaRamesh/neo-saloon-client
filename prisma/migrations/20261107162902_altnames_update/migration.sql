/*
  Warnings:

  - You are about to drop the column `altName` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "altName",
ADD COLUMN     "altNames" TEXT[] DEFAULT ARRAY[]::TEXT[];
