import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReceiptsClient } from "./ReceiptsClient";

export default async function ReceiptsPage() {
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");

  const orgId = session.user.organizationId;

  // Fetch Recent Receipts
  const receipts = await prisma.receipt.findMany({
    where: { organizationId: orgId },
    include: {
      student: { select: { name: true, class: true } },
      createdByUser: { select: { name: true } },
    },
    orderBy: { date: "desc" },
    take: 40,
  });

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

  return <ReceiptsClient receipts={serializedReceipts} />;
}
