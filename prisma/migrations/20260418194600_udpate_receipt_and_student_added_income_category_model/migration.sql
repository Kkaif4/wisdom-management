-- AlterTable
ALTER TABLE "Receipt" ADD COLUMN     "incomeCategoryId" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "rollNumber" TEXT;

-- CreateTable
CREATE TABLE "IncomeCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "affectsTuition" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncomeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IncomeCategory_organizationId_idx" ON "IncomeCategory"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "IncomeCategory_code_organizationId_key" ON "IncomeCategory"("code", "organizationId");

-- CreateIndex
CREATE INDEX "Receipt_incomeCategoryId_idx" ON "Receipt"("incomeCategoryId");

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_incomeCategoryId_fkey" FOREIGN KEY ("incomeCategoryId") REFERENCES "IncomeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomeCategory" ADD CONSTRAINT "IncomeCategory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
