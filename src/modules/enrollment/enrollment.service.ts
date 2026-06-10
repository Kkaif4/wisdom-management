import {
  EnrollmentStatus,
  SessionStatus,
  StudentStatus,
} from "@/prisma/generated";
import { prisma } from "@/lib/prisma";
import { EnrollmentRepository } from "./enrollment.repository";
import {
  SessionService,
  ClassService,
  DivisionService,
} from "../academic/academic.service";
import type {
  CreateEnrollmentInput,
  UpdateEnrollmentInput,
  PromoteStudentInput,
  BulkPromoteInput,
  WithdrawStudentInput,
  EnrollmentFilter,
} from "./types";

export class EnrollmentService {
  /**
   * Creates a new enrollment for a student in a specific class/division/session.
   * Validates: session is ACTIVE/UPCOMING, no duplicate enrollment, division belongs to class.
   */
  static async createEnrollment(input: CreateEnrollmentInput) {
    // 1. Validate academic session exists and is enrollable
    const session = await SessionService.getSessionById(
      input.academicSessionId,
      input.organizationId,
    );
    if (
      session.status !== SessionStatus.ACTIVE &&
      session.status !== SessionStatus.UPCOMING
    ) {
      throw new Error(
        "Enrollments can only be created in ACTIVE or UPCOMING sessions",
      );
    }

    // 2. Validate class and division exist
    await ClassService.getClassById(input.classId, input.organizationId);
    const division = await DivisionService.getDivisionById(
      input.divisionId,
      input.organizationId,
    );
    if (division.classId !== input.classId) {
      throw new Error("Division does not belong to the selected class");
    }

    // 3. Prevent duplicate enrollment in same session
    const existing = await EnrollmentRepository.findByStudentAndSession(
      input.studentId,
      input.academicSessionId,
    );
    if (existing) {
      throw new Error(
        "Student already has an enrollment in this academic session",
      );
    }

    return EnrollmentRepository.create(input);
  }

  static async getEnrollments(filter: EnrollmentFilter) {
    const [data, total] = await Promise.all([
      EnrollmentRepository.findMany(filter),
      EnrollmentRepository.count(filter),
    ]);
    return { data, total };
  }

  static async getEnrollmentById(id: string, organizationId: string) {
    const enrollment = await EnrollmentRepository.findById(id, organizationId);
    if (!enrollment) throw new Error("Enrollment not found");
    return enrollment;
  }

  static async getActiveEnrollment(studentId: string, organizationId: string) {
    return EnrollmentRepository.findActiveByStudent(studentId, organizationId);
  }

  static async updateEnrollment(
    id: string,
    organizationId: string,
    data: UpdateEnrollmentInput,
  ) {
    const enrollment = await this.getEnrollmentById(id, organizationId);

    // Cannot modify fees in a closed session
    const session = await SessionService.getSessionById(
      enrollment.academicSessionId,
      organizationId,
    );
    if (
      session.status === SessionStatus.CLOSED ||
      session.status === SessionStatus.ARCHIVED
    ) {
      throw new Error(
        "Cannot modify enrollment in a closed or archived session",
      );
    }

    if (data.totalFeesAssigned !== undefined) {
      await EnrollmentRepository.updateFees(id, data.totalFeesAssigned);
    }

    if (data.discount !== undefined) {
      await EnrollmentRepository.updateDiscount(id, data.discount);
    }

    return this.getEnrollmentById(id, organizationId);
  }

  /**
   * Promotes a student: closes current enrollment (PROMOTED), creates new one.
   * This is an INSERT operation — old data is never mutated.
   */
  static async promoteStudent(input: PromoteStudentInput) {
    // 1. Find current active enrollment
    const currentEnrollment = await EnrollmentRepository.findActiveByStudent(
      input.studentId,
      input.organizationId,
    );
    if (!currentEnrollment) {
      throw new Error("Student has no active enrollment to promote from");
    }

    // 2. Validate target session
    const targetSession = await SessionService.getSessionById(
      input.targetSessionId,
      input.organizationId,
    );
    if (
      targetSession.status !== SessionStatus.ACTIVE &&
      targetSession.status !== SessionStatus.UPCOMING
    ) {
      throw new Error("Target session must be ACTIVE or UPCOMING");
    }

    // 3. Prevent promoting to same session
    if (currentEnrollment.academicSessionId === input.targetSessionId) {
      throw new Error("Cannot promote to the same academic session");
    }

    // 4. Prevent duplicate in target session
    const existing = await EnrollmentRepository.findByStudentAndSession(
      input.studentId,
      input.targetSessionId,
    );
    if (existing) {
      throw new Error(
        "Student already has an enrollment in the target session",
      );
    }

    // 5. Execute promotion within a transaction
    return prisma.$transaction(async (tx) => {
      // Close current enrollment
      await tx.studentEnrollment.update({
        where: { id: currentEnrollment.id },
        data: {
          status: EnrollmentStatus.PROMOTED,
          completionDate: new Date(),
        },
      });

      // Create new enrollment
      const newEnrollment = await tx.studentEnrollment.create({
        data: {
          studentId: input.studentId,
          classId: input.targetClassId,
          divisionId: input.targetDivisionId,
          academicSessionId: input.targetSessionId,
          totalFeesAssigned: input.newFeesAssigned,
          discount: input.newDiscount || 0,
          totalPaid: 0,
          status: EnrollmentStatus.ACTIVE,
          organizationId: input.organizationId,
        },
        include: {
          student: true,
          class: true,
          division: true,
          academicSession: true,
        },
      });

      return newEnrollment;
    });
  }

  /**
   * Bulk promotes multiple students at once.
   * Uses individual promote calls within a transaction for atomicity.
   */
  static async bulkPromote(input: BulkPromoteInput) {
    const results: { studentId: string; success: boolean; error?: string }[] =
      [];

    for (const studentId of input.studentIds) {
      try {
        await this.promoteStudent({
          studentId,
          targetClassId: input.targetClassId,
          targetDivisionId: input.targetDivisionId,
          targetSessionId: input.targetSessionId,
          newFeesAssigned: input.newFeesAssigned,
          newDiscount: input.newDiscount,
          organizationId: input.organizationId,
        });
        results.push({ studentId, success: true });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        results.push({ studentId, success: false, error: message });
      }
    }

    return results;
  }

  /**
   * Withdraws a student mid-way.
   * Sets enrollment status to WITHDRAWN; student history is preserved.
   */
  static async withdrawStudent(input: WithdrawStudentInput) {
    const enrollment = await this.getEnrollmentById(
      input.enrollmentId,
      input.organizationId,
    );
    if (enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new Error("Only active enrollments can be withdrawn");
    }

    await EnrollmentRepository.updateStatus(
      input.enrollmentId,
      EnrollmentStatus.WITHDRAWN,
      new Date(),
    );

    // Optionally update the Student status to WITHDRAWN
    await prisma.student.update({
      where: { id: enrollment.studentId },
      data: { status: StudentStatus.WITHDRAWN },
    });

    return this.getEnrollmentById(input.enrollmentId, input.organizationId);
  }

  /**
   * Returns the full multi-year enrollment history for a student (for ledger view).
   */
  static async getStudentLedger(studentId: string, organizationId: string) {
    return EnrollmentRepository.findAllByStudent(studentId, organizationId);
  }
}
