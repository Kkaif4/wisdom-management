import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WithdrawnStudentsClient } from "./WithdrawnStudentsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Withdrawn Students | Wisdom Finance",
  description: "View and manage records of students who have withdrawn from the institution.",
};

export default async function WithdrawnStudentsPage() {
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");

  const orgId = session.user.organizationId;

  const students = await prisma.student.findMany({
    where: {
      organizationId: orgId,
      status: "WITHDRAWN",
    },
    include: {
      enrollments: {
        include: {
          class: true,
          division: true,
          academicSession: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });

  const serialized = students.map((s) => {
    const enrollment = s.enrollments[0];
    return {
      id: s.id,
      name: s.name,
      grNo: s.grNo,
      status: s.status,
      className: enrollment?.class?.name || "—",
      divisionName: enrollment?.division?.name || "",
      sessionName: enrollment?.academicSession?.name || "",
      totalFeesAssigned: enrollment ? Number(enrollment.totalFeesAssigned) : 0,
      totalPaid: enrollment ? Number(enrollment.totalPaid) : 0,
      enrollmentId: enrollment?.id || null,
    };
  });

  return <WithdrawnStudentsClient initialStudents={serialized} />;
}
