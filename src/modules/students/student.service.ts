import { prisma } from "@/lib/prisma";
import { StudentStatus } from "@/prisma/generated";

// ──────────────────────────────────────────────────────────────────────
// Student Service — Identity Layer Only
//
// Financial fields (totalFeesAssigned, totalPaid) are now on
// StudentEnrollment. This service manages student identity and status.
// ──────────────────────────────────────────────────────────────────────

export class StudentService {
  /**
   * Creates a new student record (identity only — no fee fields).
   */
  static async createStudent(params: {
    admissionNumber: string;
    name: string;
    rollNumber?: string;
    organizationId: string;
    dateOfBirth?: Date;
    gender?: string;
    contactNumber?: string;
    email?: string;
    address?: string;
    fatherName?: string;
    motherName?: string;
    guardianContact?: string;
  }) {
    return prisma.student.create({
      data: {
        admissionNumber: params.admissionNumber,
        name: params.name,
        rollNumber: params.rollNumber,
        organizationId: params.organizationId,
        dateOfBirth: params.dateOfBirth,
        gender: params.gender,
        contactNumber: params.contactNumber,
        email: params.email,
        address: params.address,
        fatherName: params.fatherName,
        motherName: params.motherName,
        guardianContact: params.guardianContact,
      },
    });
  }

  /**
   * Lists students with their current active enrollment details.
   */
  static async getStudents(params: {
    organizationId: string;
    search?: string;
    status?: StudentStatus;
    sessionId?: string;
    classId?: string;
    divisionId?: string;
    skip?: number;
    take?: number;
  }) {
    const {
      organizationId,
      search,
      status,
      sessionId,
      classId,
      divisionId,
      skip,
      take,
    } = params;

    const where: any = {
      organizationId,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { admissionNumber: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    // If session/class/division filters are provided, we filter by enrollments
    if (sessionId || classId || divisionId) {
      where.enrollments = {
        some: {
          ...(sessionId ? { academicSessionId: sessionId } : {}),
          ...(classId ? { classId } : {}),
          ...(divisionId ? { divisionId } : {}),
          status: "ACTIVE", // Only filter through active enrollments for the main list
        },
      };
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        enrollments: {
          where: {
            status: "ACTIVE",
            ...(sessionId ? { academicSessionId: sessionId } : {}),
          },
          include: {
            class: true,
            division: true,
            academicSession: true,
          },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
      skip,
      take,
    });

    // Flatten enrollment data for easier consumption by the client
    return students.map((s) => {
      const activeEnrollment = s.enrollments[0] || null;
      return {
        ...s,
        enrollment: activeEnrollment,
        className: activeEnrollment?.class?.name || null,
        divisionName: activeEnrollment?.division?.name || null,
        totalFeesAssigned: activeEnrollment
          ? Number(activeEnrollment.totalFeesAssigned)
          : 0,
        totalPaid: activeEnrollment ? Number(activeEnrollment.totalPaid) : 0,
      };
    });
  }

  /**
   * Returns the count of students for pagination.
   */
  static async countStudents(params: {
    organizationId: string;
    search?: string;
    status?: StudentStatus;
    sessionId?: string;
    classId?: string;
    divisionId?: string;
  }) {
    const { organizationId, search, status, sessionId, classId, divisionId } =
      params;

    const where: any = {
      organizationId,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { admissionNumber: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    if (sessionId || classId || divisionId) {
      where.enrollments = {
        some: {
          ...(sessionId ? { academicSessionId: sessionId } : {}),
          ...(classId ? { classId } : {}),
          ...(divisionId ? { divisionId } : {}),
          status: "ACTIVE",
        },
      };
    }

    return prisma.student.count({ where });
  }

  /**
   * Gets a specific student with all their enrollment history.
   */
  static async getStudentById(id: string, organizationId: string) {
    return prisma.student.findUnique({
      where: { id, organizationId },
      include: {
        enrollments: {
          include: {
            class: true,
            division: true,
            academicSession: true,
          },
          orderBy: { academicSession: { startDate: "desc" } },
        },
      },
    });
  }

  /**
   * Updates student identity fields.
   */
  static async updateStudent(
    id: string,
    organizationId: string,
    data: {
      name?: string;
      admissionNumber?: string;
      rollNumber?: string;
      dateOfBirth?: Date;
      gender?: string;
      contactNumber?: string;
      email?: string;
      address?: string;
      fatherName?: string;
      motherName?: string;
      guardianContact?: string;
    },
  ) {
    return prisma.student.update({
      where: { id, organizationId },
      data,
    });
  }

  /**
   * Updates student lifecycle status.
   */
  static async updateStatus(
    id: string,
    organizationId: string,
    status: StudentStatus,
  ) {
    return prisma.student.update({
      where: { id, organizationId },
      data: { status },
    });
  }

  /**
   * Returns students who have withdrawn or left (for "Previous Students" view).
   */
  static async getPreviousStudents(organizationId: string) {
    return prisma.student.findMany({
      where: {
        organizationId,
        status: {
          in: [
            StudentStatus.WITHDRAWN,
            StudentStatus.ALUMNI,
            StudentStatus.INACTIVE,
          ],
        },
      },
      include: {
        enrollments: {
          include: {
            class: true,
            division: true,
            academicSession: true,
          },
          orderBy: { academicSession: { startDate: "desc" } },
        },
      },
      orderBy: { name: "asc" },
    });
  }
}
