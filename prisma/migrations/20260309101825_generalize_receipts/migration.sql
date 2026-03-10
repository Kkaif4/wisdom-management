-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'OTHER_INCOME';

-- DropForeignKey
ALTER TABLE "Receipt" DROP CONSTRAINT "Receipt_studentId_fkey";

-- AlterTable
ALTER TABLE "Receipt" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Tuition Fee',
ALTER COLUMN "studentId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Receipt_category_idx" ON "Receipt"("category");

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
