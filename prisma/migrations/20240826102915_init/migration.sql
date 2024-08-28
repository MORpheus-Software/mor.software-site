/*
  Warnings:

  - You are about to drop the column `description` on the `BidForm` table. All the data in the column will be lost.
  - You are about to drop the column `minimumWeightsTime` on the `BidForm` table. All the data in the column will be lost.
  - You are about to drop the column `githubAccount` on the `User` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Proposal` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_githubAccount_key";

-- AlterTable
ALTER TABLE "BidForm" DROP COLUMN "description",
DROP COLUMN "minimumWeightsTime";

-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "githubAccount";

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintainer" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "Maintainer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintainer" ADD CONSTRAINT "Maintainer_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintainer" ADD CONSTRAINT "Maintainer_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
