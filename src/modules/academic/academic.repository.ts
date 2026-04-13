import { prisma } from "@/lib/prisma";
import { SessionStatus } from "@/prisma/generated";
import type {
  CreateClassInput,
  UpdateClassInput,
  CreateDivisionInput,
  UpdateDivisionInput,
  CreateSessionInput,
  UpdateSessionInput,
  SessionFilter,
} from "./types";

// ──────────────────────────────────────────────────────────────────────
// Class Repository
// ──────────────────────────────────────────────────────────────────────

export class ClassRepository {
  static async create(data: CreateClassInput) {
    return prisma.class.create({ data });
  }

  static async findByOrg(organizationId: string) {
    return prisma.class.findMany({
      where: { organizationId },
      include: { divisions: true },
      orderBy: { displayOrder: "asc" },
    });
  }

  static async findById(id: string, organizationId: string) {
    return prisma.class.findFirst({
      where: { id, organizationId },
      include: { divisions: true },
    });
  }

  static async update(
    id: string,
    organizationId: string,
    data: UpdateClassInput,
  ) {
    return prisma.class.update({
      where: { id, organizationId },
      data,
    });
  }

  static async delete(id: string, organizationId: string) {
    return prisma.class.delete({
      where: { id, organizationId },
    });
  }

  static async hasEnrollments(id: string) {
    const count = await prisma.studentEnrollment.count({
      where: { classId: id },
    });
    return count > 0;
  }
}

// ──────────────────────────────────────────────────────────────────────
// Division Repository
// ──────────────────────────────────────────────────────────────────────

export class DivisionRepository {
  static async create(data: CreateDivisionInput) {
    return prisma.division.create({ data });
  }

  static async findByClass(classId: string, organizationId: string) {
    return prisma.division.findMany({
      where: { classId, organizationId },
      orderBy: { name: "asc" },
    });
  }

  static async findById(id: string, organizationId: string) {
    return prisma.division.findFirst({
      where: { id, organizationId },
    });
  }

  static async update(
    id: string,
    organizationId: string,
    data: UpdateDivisionInput,
  ) {
    return prisma.division.update({
      where: { id, organizationId },
      data,
    });
  }

  static async delete(id: string, organizationId: string) {
    return prisma.division.delete({
      where: { id, organizationId },
    });
  }

  static async hasEnrollments(id: string) {
    const count = await prisma.studentEnrollment.count({
      where: { divisionId: id },
    });
    return count > 0;
  }
}

// ──────────────────────────────────────────────────────────────────────
// Academic Session Repository
// ──────────────────────────────────────────────────────────────────────

export class SessionRepository {
  static async create(data: CreateSessionInput) {
    return prisma.academicSession.create({
      data: { ...data, status: SessionStatus.UPCOMING },
    });
  }

  static async findByOrg(filter: SessionFilter) {
    return prisma.academicSession.findMany({
      where: {
        organizationId: filter.organizationId,
        ...(filter.status ? { status: filter.status } : {}),
      },
      orderBy: { startDate: "desc" },
    });
  }

  static async findById(id: string, organizationId: string) {
    return prisma.academicSession.findFirst({
      where: { id, organizationId },
    });
  }

  static async findActive(organizationId: string) {
    return prisma.academicSession.findFirst({
      where: { organizationId, status: SessionStatus.ACTIVE },
    });
  }

  static async update(
    id: string,
    organizationId: string,
    data: UpdateSessionInput,
  ) {
    return prisma.academicSession.update({
      where: { id, organizationId },
      data,
    });
  }

  static async updateStatus(
    id: string,
    organizationId: string,
    status: SessionStatus,
  ) {
    return prisma.academicSession.update({
      where: { id, organizationId },
      data: { status },
    });
  }

  static async hasEnrollments(id: string) {
    const count = await prisma.studentEnrollment.count({
      where: { academicSessionId: id },
    });
    return count > 0;
  }
}
