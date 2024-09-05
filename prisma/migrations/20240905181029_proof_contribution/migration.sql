/*
  Warnings:

  - Added the required column `categoryId` to the `ProofContribution` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProofContribution" ADD COLUMN     "categoryId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ProofContribution" ADD CONSTRAINT "ProofContribution_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
