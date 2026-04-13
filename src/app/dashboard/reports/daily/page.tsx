import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DailyReportClient } from "./DailyReportClient";

export default async function DailyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");

  const { date: dateStr } = await searchParams;
  const targetDate = dateStr ? new Date(dateStr) : new Date();

  // Set to start and end of selected day for filtering
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const receipts = await prisma.receipt.findMany({
    where: {
      organizationId: session.user.organizationId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      student: { select: { name: true } },
      studentEnrollment: { include: { class: { select: { name: true } } } },
    },
    orderBy: { date: "asc" },
  });

  const serialized = receipts.map((r) => ({
    id: r.id,
    receiptNumber: r.receiptNumber,
    studentName: r.student?.name || "N/A",
    studentClass: r.studentEnrollment?.class?.name || "N/A",
    amount: Number(r.amount),
    paymentMode: r.paymentMode,
    status: r.status,
  }));

  return (
    <DailyReportClient
      initialDate={targetDate.toISOString().split("T")[0]}
      receipts={serialized}
    />
  );
}
