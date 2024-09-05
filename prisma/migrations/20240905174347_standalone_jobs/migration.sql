-- CreateTable
CREATE TABLE "StandaloneJobForm" (
    "id" TEXT NOT NULL,
    "githubUsername" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "deliverables" TEXT NOT NULL,
    "weightsRequested" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "minimumWeightsTime" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "StandaloneJobForm_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StandaloneJobForm" ADD CONSTRAINT "StandaloneJobForm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandaloneJobForm" ADD CONSTRAINT "StandaloneJobForm_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
