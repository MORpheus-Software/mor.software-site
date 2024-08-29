/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Maintainer` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Maintainer" DROP CONSTRAINT "Maintainer_categoryId_fkey";

-- AlterTable
ALTER TABLE "JobForm" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Maintainer" DROP COLUMN "categoryId";

-- CreateTable
CREATE TABLE "MaintainerCategory" (
    "maintainerId" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "MaintainerCategory_pkey" PRIMARY KEY ("maintainerId","categoryId")
);

-- CreateTable
CREATE TABLE "JobFormComment" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "jobFormId" TEXT NOT NULL,

    CONSTRAINT "JobFormComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalComment" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "proposalId" INTEGER NOT NULL,

    CONSTRAINT "ProposalComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MaintainerCategory" ADD CONSTRAINT "MaintainerCategory_maintainerId_fkey" FOREIGN KEY ("maintainerId") REFERENCES "Maintainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintainerCategory" ADD CONSTRAINT "MaintainerCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobFormComment" ADD CONSTRAINT "JobFormComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobFormComment" ADD CONSTRAINT "JobFormComment_jobFormId_fkey" FOREIGN KEY ("jobFormId") REFERENCES "JobForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalComment" ADD CONSTRAINT "ProposalComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalComment" ADD CONSTRAINT "ProposalComment_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
