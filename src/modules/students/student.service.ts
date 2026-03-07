import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated";

export class StudentService {
  /**
   * Creates a new student record.
   */
  static async createStudent(params: {
    name: string;
    studentClass: string;
    totalFeesAssigned: Prisma.Decimal;
    organizationId: string;
  }) {
    const { name, studentClass, totalFeesAssigned, organizationId } = params;

    return await prisma.student.create({
      data: {
        name,
        class: studentClass,
        totalFeesAssigned,
        totalPaid: new Prisma.Decimal(0),
        organizationId,
      },
    });
  }

  /**
   * Lists all students for an organization.
   */
  static async getStudents(organizationId: string) {
    return await prisma.student.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Gets a specific student with their current financial summary.
   */
  static async getStudentById(id: string, organizationId: string) {
    return await prisma.student.findUnique({
      where: { id, organizationId },
    });
  }

  /**
   * Updates the total fees assigned to a student.
   */
  static async updateTotalFees(
    id: string,
    organizationId: string,
    newTotal: Prisma.Decimal,
  ) {
    return await prisma.student.update({
      where: { id, organizationId },
      data: {
        totalFeesAssigned: newTotal,
      },
    });
  }

  /**
   * Generates a detailed account statement for a student.
   * Returns a list of receipts (including cancelled ones).
   */
  static async getStudentStatement(studentId: string, organizationId: string) {
    const student = await prisma.student.findUniqueOrThrow({
      where: { id: studentId, organizationId },
      include: {
        receipts: {
          orderBy: { date: "desc" },
        },
      },
    });

    return {
      student: {
        name: student.name,
        class: student.class,
        totalFeesAssigned: student.totalFeesAssigned,
        totalPaid: student.totalPaid,
        remainingFees: student.totalFeesAssigned.minus(student.totalPaid),
      },
      transactions: student.receipts,
    };
  }
}
