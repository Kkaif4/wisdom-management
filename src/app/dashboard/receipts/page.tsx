import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReceiptsClient } from "./ReceiptsClient";

export default async function ReceiptsPage() {
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");

  const orgId = session.user.organizationId;

  // 1. Fetch Students for the entry dropdown
  const students = await prisma.student.findMany({
    where: { organizationId: orgId },
    select: {
      id: true,
      name: true,
      class: true,
      totalFeesAssigned: true,
      totalPaid: true,
    },
    orderBy: { name: "asc" },
  });

  // 2. Fetch Recent Receipts
  const receipts = await prisma.receipt.findMany({
    where: { organizationId: orgId },
    include: {
      student: { select: { name: true, class: true } },
      createdByUser: { select: { name: true } },
    },
    orderBy: { date: "desc" },
    take: 40,
  });

  const serializedStudents = students.map((s) => ({
    id: s.id,
    name: s.name,
    class: s.class,
    totalFeesAssigned: Number(s.totalFeesAssigned),
    totalPaid: Number(s.totalPaid),
  }));

  const serializedReceipts = receipts.map((r) => ({
    id: r.id,
    receiptNumber: r.receiptNumber,
    amount: Number(r.amount),
    paymentMode: r.paymentMode,
    date: r.date.toISOString(),
    status: r.status,
    remarks: r.remarks,
    studentName: r.student.name,
    studentClass: r.student.class,
    recordedBy: r.createdByUser.name,
  }));

  return (
    <ReceiptsClient
      students={serializedStudents}
      receipts={serializedReceipts}
    />
  );
}
