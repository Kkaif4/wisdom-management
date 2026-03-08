import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReceiptsClient } from "./ReceiptsClient";

interface PageProps {
  searchParams: Promise<{ p?: string }>;
}

export default async function ReceiptsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");

  const { p: pageNum } = await searchParams;
  const page = parseInt(pageNum || "1");
  const limit = 15;
  const skip = (page - 1) * limit;

  const orgId = session.user.organizationId;

  // Fetch Current Page of Receipts + Total Count
  const [receipts, total] = await Promise.all([
    prisma.receipt.findMany({
      where: { organizationId: orgId },
      include: {
        student: { select: { name: true, class: true } },
        createdByUser: { select: { name: true } },
      },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.receipt.count({
      where: { organizationId: orgId },
    }),
  ]);

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
      receipts={serializedReceipts}
      currentPage={page}
      totalPages={Math.ceil(total / limit)}
    />
  );
}
