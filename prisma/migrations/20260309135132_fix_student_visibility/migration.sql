-- DropForeignKey
ALTER TABLE "Receipt" DROP CONSTRAINT "Receipt_studentId_fkey";

-- AlterTable
ALTER TABLE "Receipt" ALTER COLUMN "studentId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "TransactionHistory_studentId_idx" ON "TransactionHistory"("studentId");

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
