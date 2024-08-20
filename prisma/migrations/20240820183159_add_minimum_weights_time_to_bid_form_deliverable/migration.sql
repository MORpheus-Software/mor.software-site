/*
  Warnings:

  - You are about to drop the `Contribution` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Contribution" DROP CONSTRAINT "Contribution_userId_fkey";

-- DropTable
DROP TABLE "Contribution";

-- CreateTable
CREATE TABLE "BidForm" (
    "id" TEXT NOT NULL,
    "githubUsername" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mriNumber" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "minimumWeightsTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BidForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BidFormDeliverable" (
    "id" TEXT NOT NULL,
    "bidFormId" TEXT NOT NULL,
    "deliverableId" INTEGER NOT NULL,
    "weightsRequested" TEXT NOT NULL,
    "deliverableDescription" TEXT NOT NULL,
    "minimumWeightsTime" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "BidFormDeliverable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProofContribution" (
    "id" TEXT NOT NULL,
    "githubUsername" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mriNumber" TEXT NOT NULL,
    "linksToProof" TEXT NOT NULL,
    "weightsAgreed" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ProofContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mri" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deliverable" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "proposalId" INTEGER NOT NULL,

    CONSTRAINT "Deliverable_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BidForm" ADD CONSTRAINT "BidForm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidFormDeliverable" ADD CONSTRAINT "BidFormDeliverable_bidFormId_fkey" FOREIGN KEY ("bidFormId") REFERENCES "BidForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BidFormDeliverable" ADD CONSTRAINT "BidFormDeliverable_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "Deliverable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProofContribution" ADD CONSTRAINT "ProofContribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
