import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LedgerClient } from "./LedgerClient";

export default async function LedgerPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await searchParamsPromise;
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");

  const orgId = session.user.organizationId;

  const getSingle = (val: string | string[] | undefined) =>
    Array.isArray(val) ? val[0] : val;
  const pageParam = getSingle(searchParams.p);
  const queryParam = getSingle(searchParams.q);

  const page = Math.max(1, parseInt(pageParam || "1"));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: any = { organizationId: orgId };
  if (queryParam) {
    where.description = { contains: queryParam, mode: "insensitive" };
  }

  try {
    // Fetch Current Page of Transactions + Total Count
    const [total, recentTransactions] = await Promise.all([
      prisma.transactionHistory.count({ where }),
      prisma.transactionHistory.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { name: true } },
        },
      }),
    ]);

    const transactions = recentTransactions.map((tx) => ({
      id: tx.id,
      date: tx.date.toISOString(),
      type: tx.type,
      description: tx.description ?? "",
      debitAmount: tx.debitAmount ? Number(tx.debitAmount) : null,
      creditAmount: tx.creditAmount ? Number(tx.creditAmount) : null,
      balanceAfter: Number(tx.balanceAfter),
      impactedAccount: tx.impactedAccount,
      createdBy: tx.user.name,
    }));

    return (
      <LedgerClient
        transactions={transactions}
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
        totalRecords={total}
        filters={{ query: queryParam || "" }}
      />
    );
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return (
      <LedgerClient
        transactions={[]}
        currentPage={1}
        totalPages={0}
        totalRecords={0}
        error="Failed to synchronization ledger data."
        filters={{ query: queryParam || "" }}
      />
    );
  }
}
