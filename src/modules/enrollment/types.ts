import { EnrollmentStatus } from "@/prisma/generated";
import { Prisma } from "@/prisma/generated";

export interface CreateEnrollmentInput {
  studentId: string;
  classId: string;
  divisionId: string;
  academicSessionId: string;
  totalFeesAssigned: Prisma.Decimal;
  organizationId: string;
  remarks?: string;
}

export interface UpdateEnrollmentInput {
  totalFeesAssigned?: Prisma.Decimal;
  remarks?: string;
}

export interface PromoteStudentInput {
  studentId: string;
  targetClassId: string;
  targetDivisionId: string;
  targetSessionId: string;
  newFeesAssigned: Prisma.Decimal;
  organizationId: string;
}

export interface BulkPromoteInput {
  studentIds: string[];
  targetClassId: string;
  targetDivisionId: string;
  targetSessionId: string;
  newFeesAssigned: Prisma.Decimal;
  organizationId: string;
}

export interface WithdrawStudentInput {
  enrollmentId: string;
  organizationId: string;
  remarks?: string;
}

export interface EnrollmentFilter {
  organizationId: string;
  academicSessionId?: string;
  classId?: string;
  divisionId?: string;
  status?: EnrollmentStatus;
  search?: string;
  skip?: number;
  take?: number;
}
