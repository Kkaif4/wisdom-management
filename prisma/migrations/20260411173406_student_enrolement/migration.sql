/*
  Warnings:

  - You are about to drop the column `class` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `totalFeesAssigned` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `totalPaid` on the `Student` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[admissionNumber,organizationId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `studentEnrollmentId` to the `Receipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `admissionNumber` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'PROMOTED', 'WITHDRAWN', 'TRANSFERRED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ALUMNI', 'WITHDRAWN');

-- AlterTable
ALTER TABLE "Receipt" ADD COLUMN     "studentEnrollmentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "class",
DROP COLUMN "totalFeesAssigned",
DROP COLUMN "totalPaid",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "admissionNumber" TEXT NOT NULL,
ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "email" TEXT,
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "guardianContact" TEXT,
ADD COLUMN     "motherName" TEXT,
ADD COLUMN     "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "TransactionHistory" ADD COLUMN     "studentEnrollmentId" TEXT;

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Division" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER,
    "classId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicSession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'UPCOMING',
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentEnrollment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "divisionId" TEXT NOT NULL,
    "academicSessionId" TEXT NOT NULL,
    "totalFeesAssigned" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalPaid" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completionDate" TIMESTAMP(3),
    "remarks" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Class_organizationId_idx" ON "Class"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Class_name_organizationId_key" ON "Class"("name", "organizationId");

-- CreateIndex
CREATE INDEX "Division_classId_idx" ON "Division"("classId");

-- CreateIndex
CREATE INDEX "Division_organizationId_idx" ON "Division"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Division_name_classId_key" ON "Division"("name", "classId");

-- CreateIndex
CREATE INDEX "AcademicSession_organizationId_idx" ON "AcademicSession"("organizationId");

-- CreateIndex
CREATE INDEX "AcademicSession_status_idx" ON "AcademicSession"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicSession_name_organizationId_key" ON "AcademicSession"("name", "organizationId");

-- CreateIndex
CREATE INDEX "StudentEnrollment_organizationId_idx" ON "StudentEnrollment"("organizationId");

-- CreateIndex
CREATE INDEX "StudentEnrollment_studentId_idx" ON "StudentEnrollment"("studentId");

-- CreateIndex
CREATE INDEX "StudentEnrollment_academicSessionId_idx" ON "StudentEnrollment"("academicSessionId");

-- CreateIndex
CREATE INDEX "StudentEnrollment_classId_idx" ON "StudentEnrollment"("classId");

-- CreateIndex
CREATE INDEX "StudentEnrollment_status_idx" ON "StudentEnrollment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "StudentEnrollment_studentId_academicSessionId_key" ON "StudentEnrollment"("studentId", "academicSessionId");

-- CreateIndex
CREATE INDEX "Receipt_studentEnrollmentId_idx" ON "Receipt"("studentEnrollmentId");

-- CreateIndex
CREATE INDEX "Student_status_idx" ON "Student"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Student_admissionNumber_organizationId_key" ON "Student"("admissionNumber", "organizationId");

-- CreateIndex
CREATE INDEX "TransactionHistory_studentEnrollmentId_idx" ON "TransactionHistory"("studentEnrollmentId");

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicSession" ADD CONSTRAINT "AcademicSession_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_studentEnrollmentId_fkey" FOREIGN KEY ("studentEnrollmentId") REFERENCES "StudentEnrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionHistory" ADD CONSTRAINT "TransactionHistory_studentEnrollmentId_fkey" FOREIGN KEY ("studentEnrollmentId") REFERENCES "StudentEnrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
