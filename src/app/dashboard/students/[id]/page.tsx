import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatementClient } from "@/app/dashboard/students/[id]/StatementClient";

export default async function StudentStatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");

  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id, organizationId: session.user.organizationId },
    include: {
      receipts: { orderBy: { date: "desc" } },
    },
  });

  if (!student) redirect("/dashboard/students");

  const serialized = {
    name: student.name,
    class: student.class,
    totalFeesAssigned: Number(student.totalFeesAssigned),
    totalPaid: Number(student.totalPaid),
    receipts: student.receipts.map((r) => ({
      id: r.id,
      receiptNumber: r.receiptNumber,
      date: r.date.toISOString(),
      amount: Number(r.amount),
      paymentMode: r.paymentMode,
      status: r.status,
      remarks: r.remarks,
    })),
  };

  return <StatementClient student={serialized} />;
}
