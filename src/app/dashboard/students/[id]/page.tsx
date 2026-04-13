import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { StatementClient } from "@/app/dashboard/students/[id]/StatementClient";
import { StudentService } from "@/modules/students/student.service";
import { EnrollmentService } from "@/modules/enrollment/enrollment.service";

export default async function StudentStatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");

  const { id } = await params;
  const orgId = session.user.organizationId;

  try {
    const [student, enrollments] = await Promise.all([
      StudentService.getStudentById(id, orgId),
      EnrollmentService.getStudentLedger(id, orgId),
    ]);

    if (!student) notFound();

    // Compute total outstanding across all enrollments
    const totalOutstanding = enrollments.reduce((sum, e) => {
      const remaining = Number(e.totalFeesAssigned) - Number(e.totalPaid);
      return sum + Math.max(0, remaining);
    }, 0);

    // Serialize data for Client Component
    const serializedData = {
      student: {
        id: student.id,
        admissionNumber: student.admissionNumber,
        name: student.name,
        status: student.status,
      },
      enrollments: enrollments.map((e) => ({
        id: e.id,
        className: e.class.name,
        divisionName: e.division.name,
        sessionName: e.academicSession.name,
        status: e.status,
        totalFeesAssigned: Number(e.totalFeesAssigned),
        totalPaid: Number(e.totalPaid),
        remaining: Number(e.totalFeesAssigned) - Number(e.totalPaid),
        receipts: e.receipts.map((r) => ({
          id: r.id,
          receiptNumber: r.receiptNumber,
          date: r.date.toISOString(),
          amount: Number(r.amount),
          paymentMode: r.paymentMode,
          status: r.status,
          remarks: r.remarks,
        })),
      })),
      totalOutstanding,
    };

    return <StatementClient data={serializedData} />;
  } catch (error) {
    console.error("Statement Load Error:", error);
    redirect("/dashboard/students");
  }
}
