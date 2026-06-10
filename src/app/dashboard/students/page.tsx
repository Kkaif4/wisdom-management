import { SessionService } from "@/modules/auth/services/session.service";
import {
  AuthenticationError,
  ForbiddenError,
} from "@/modules/auth/types/auth.types";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentsClient } from "@/app/dashboard/students/StudentsClient";

export default async function StudentsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await searchParamsPromise;

  let user;
  try {
    user = await SessionService.requirePermission("VIEW_STUDENTS_SCREEN");
  } catch (error) {
    if (error instanceof AuthenticationError) redirect("/login");
    if (error instanceof ForbiddenError) redirect("/dashboard?error=forbidden");
    throw error;
  }

  const orgId = user.organizationId!;

  const getSingle = (val: string | string[] | undefined) =>
    Array.isArray(val) ? val[0] : val;
  const pageParam = getSingle(searchParams.p);
  const searchParam = getSingle(searchParams.q);
  const sessionId = getSingle(searchParams.sessionId);
  const classId = getSingle(searchParams.classId);
  const divisionId = getSingle(searchParams.divisionId);
  const status = (getSingle(searchParams.status) as any) || "ACTIVE";

  const page = parseInt(pageParam || "1");
  const limit = 15;
  const skip = (page - 1) * limit;

  // Basic search and organization filter
  const where: any = {
    organizationId: orgId,
    status: status, // Defaults to ACTIVE
  };

  if (searchParam) {
    where.OR = [
      { name: { contains: searchParam, mode: "insensitive" } },
      { grNo: { contains: searchParam, mode: "insensitive" } },
    ];
  }

  // Enrollment-level filters
  if (sessionId || classId || divisionId) {
    where.enrollments = {
      some: {
        ...(sessionId ? { academicSessionId: sessionId } : {}),
        ...(classId ? { classId } : {}),
        ...(divisionId ? { divisionId } : {}),
        status: status,
      },
    };
  }

  try {
    const [students, total, classes, sessions] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          enrollments: {
            where: {
              status: status,
              ...(sessionId ? { academicSessionId: sessionId } : {}),
            },
            include: {
              class: true,
              division: true,
              academicSession: true,
            },
            take: 1,
            orderBy: { updatedAt: "desc" },
          },
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.student.count({ where }),
      prisma.class.findMany({
        where: { organizationId: orgId },
        include: { divisions: true },
        orderBy: { name: "asc" },
      }),
      prisma.academicSession.findMany({
        where: { organizationId: orgId },
        orderBy: { startDate: "desc" },
      }),
    ]);

    const serialized = students.map((s) => {
      const activeEnrollment = s.enrollments[0];
      return {
        id: s.id,
        name: s.name,
        grNo: s.grNo,
        status: s.status,
        className: activeEnrollment?.class?.name || "—",
        divisionName: activeEnrollment?.division?.name || "",
        sessionName: activeEnrollment?.academicSession?.name || "",
        totalFeesAssigned: activeEnrollment
          ? Number(activeEnrollment.totalFeesAssigned)
          : 0,
        discount: activeEnrollment ? Number(activeEnrollment.discount) : 0,
        totalPaid: activeEnrollment ? Number(activeEnrollment.totalPaid) : 0,
        enrollmentId: activeEnrollment?.id || null,
      };
    });

    return (
      <StudentsClient
        students={serialized}
        totalCount={total}
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
        initialSearch={searchParam || ""}
        classes={classes}
        sessions={sessions}
      />
    );
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return (
      <StudentsClient
        students={[]}
        totalCount={0}
        currentPage={1}
        totalPages={0}
        error={err?.message || "Failed to load student records. Please retry."}
        initialSearch={searchParam || ""}
        classes={[]}
        sessions={[]}
      />
    );
  }
}
