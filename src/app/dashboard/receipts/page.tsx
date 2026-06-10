import { SessionService } from "@/modules/auth/services/session.service";
import { AuthenticationError, ForbiddenError } from "@/modules/auth/types/auth.types";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReceiptsClient } from "./ReceiptsClient";

export default async function ReceiptsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await searchParamsPromise;

  let user;
  try {
    user = await SessionService.requirePermission("VIEW_RECEIPT_LIST");
  } catch (error) {
    if (error instanceof AuthenticationError) redirect("/login");
    if (error instanceof ForbiddenError) redirect("/dashboard?error=forbidden");
    throw error;
  }

  const orgId = user.organizationId!;

  const getSingle = (val: string | string[] | undefined) =>
    Array.isArray(val) ? val[0] : val;
  const pageParam = getSingle(searchParams.p);
  const queryParam = getSingle(searchParams.q);

  const page = Math.max(1, parseInt(pageParam || "1"));
  const limit = 15;
  const skip = (page - 1) * limit;

  const where: any = { organizationId: orgId };
  if (queryParam) {
    where.OR = [
      { student: { name: { contains: queryParam, mode: "insensitive" } } },
      { receiptNumber: { contains: queryParam, mode: "insensitive" } },
    ];
  }

  try {
    // Fetch Current Page of Receipts + Total Count
    const [receipts, total] = await Promise.all([
      prisma.receipt.findMany({
        where,
        include: {
          student: {
            select: {
              name: true,
              grNo: true,
              fatherName: true,
              rollNumber: true,
            },
          },
          studentEnrollment: {
            include: {
              class: { select: { name: true } },
              division: { select: { name: true } },
              academicSession: { select: { name: true } },
            },
          },
          createdByUser: { select: { name: true } },
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.receipt.count({ where }),
    ]);

    const serializedReceipts = receipts.map((r) => ({
      id: r.id,
      receiptNumber: r.receiptNumber,
      amount: Number(r.amount),
      paymentMode: r.paymentMode,
      date: r.date.toISOString(),
      status: r.status,
      remarks: r.remarks,
      category: r.category,
      studentName: r.student?.name || "N/A",
      grNo: r.student?.grNo || "",
      fatherName: r.student?.fatherName || "",
      rollNumber: r.student?.rollNumber || "",
      studentClass: r.studentEnrollment?.class?.name || "N/A",
      divisionName: r.studentEnrollment?.division?.name || "",
      sessionName: r.studentEnrollment?.academicSession?.name || "",
      recordedBy: r.createdByUser.name,
    }));

    return (
      <ReceiptsClient
        receipts={serializedReceipts}
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
        filters={{ query: queryParam || "" }}
      />
    );
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    console.error(
      "[ReceiptsPage] Error loading receipts:",
      err?.message || err,
    );
    return (
      <ReceiptsClient
        receipts={[]}
        currentPage={1}
        totalPages={0}
        error="Failed to load receipt data. Please refresh."
        filters={{ query: queryParam || "" }}
      />
    );
  }
}
