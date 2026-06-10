import { prisma } from "@/lib/prisma";
import { EnrollmentStatus, Prisma } from "@/prisma/generated";
import type { CreateEnrollmentInput, EnrollmentFilter } from "./types";

export class EnrollmentRepository {
  static async create(data: CreateEnrollmentInput) {
    return prisma.studentEnrollment.create({
      data: {
        studentId: data.studentId,
        classId: data.classId,
        divisionId: data.divisionId,
        academicSessionId: data.academicSessionId,
        totalFeesAssigned: data.totalFeesAssigned,
        discount: data.discount || new Prisma.Decimal(0),
        totalPaid: new Prisma.Decimal(0),
        status: EnrollmentStatus.ACTIVE,
        organizationId: data.organizationId,
        remarks: data.remarks,
      },
      include: {
        student: true,
        class: true,
        division: true,
        academicSession: true,
      },
    });
  }

  static async findById(id: string, organizationId: string) {
    return prisma.studentEnrollment.findFirst({
      where: { id, organizationId },
      include: {
        student: true,
        class: true,
        division: true,
        academicSession: true,
      },
    });
  }

  static async findActiveByStudent(studentId: string, organizationId: string) {
    return prisma.studentEnrollment.findFirst({
      where: {
        studentId,
        organizationId,
        status: EnrollmentStatus.ACTIVE,
      },
      include: {
        class: true,
        division: true,
        academicSession: true,
      },
    });
  }

  static async findByStudentAndSession(
    studentId: string,
    academicSessionId: string,
  ) {
    return prisma.studentEnrollment.findUnique({
      where: {
        studentId_academicSessionId: { studentId, academicSessionId },
      },
    });
  }

  static async findMany(filter: EnrollmentFilter) {
    const where: Prisma.StudentEnrollmentWhereInput = {
      organizationId: filter.organizationId,
      ...(filter.academicSessionId
        ? { academicSessionId: filter.academicSessionId }
        : {}),
      ...(filter.classId ? { classId: filter.classId } : {}),
      ...(filter.divisionId ? { divisionId: filter.divisionId } : {}),
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.search
        ? {
            student: { name: { contains: filter.search, mode: "insensitive" } },
          }
        : {}),
    };

    return prisma.studentEnrollment.findMany({
      where,
      include: {
        student: true,
        class: true,
        division: true,
        academicSession: true,
      },
      orderBy: { student: { name: "asc" } },
      skip: filter.skip,
      take: filter.take,
    });
  }

  static async count(filter: EnrollmentFilter) {
    const where: Prisma.StudentEnrollmentWhereInput = {
      organizationId: filter.organizationId,
      ...(filter.academicSessionId
        ? { academicSessionId: filter.academicSessionId }
        : {}),
      ...(filter.classId ? { classId: filter.classId } : {}),
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.search
        ? {
            student: { name: { contains: filter.search, mode: "insensitive" } },
          }
        : {}),
    };
    return prisma.studentEnrollment.count({ where });
  }

  static async updateStatus(
    id: string,
    status: EnrollmentStatus,
    completionDate?: Date,
  ) {
    return prisma.studentEnrollment.update({
      where: { id },
      data: {
        status,
        completionDate: completionDate ?? new Date(),
      },
    });
  }

  static async updateFees(id: string, totalFeesAssigned: Prisma.Decimal) {
    return prisma.studentEnrollment.update({
      where: { id },
      data: { totalFeesAssigned },
    });
  }

  static async updateDiscount(id: string, discount: Prisma.Decimal) {
    return prisma.studentEnrollment.update({
      where: { id },
      data: { discount },
    });
  }

  static async incrementPaid(id: string, amount: Prisma.Decimal) {
    return prisma.studentEnrollment.update({
      where: { id },
      data: {
        totalPaid: { increment: amount },
      },
    });
  }

  static async decrementPaid(id: string, amount: Prisma.Decimal) {
    return prisma.studentEnrollment.update({
      where: { id },
      data: {
        totalPaid: { decrement: amount },
      },
    });
  }

  /**
   * Returns all enrollments for a given student across all sessions (for ledger).
   */
  static async findAllByStudent(studentId: string, organizationId: string) {
    return prisma.studentEnrollment.findMany({
      where: { studentId, organizationId },
      include: {
        class: true,
        division: true,
        academicSession: true,
        receipts: {
          orderBy: { date: "asc" },
        },
      },
      orderBy: { academicSession: { startDate: "asc" } },
    });
  }
}
