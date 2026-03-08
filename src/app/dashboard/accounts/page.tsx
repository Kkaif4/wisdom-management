import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AccountsClient } from "./AccountsClient";
import { AccountType } from "@/prisma/generated";

export default async function AccountsPage({
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

  // 1. Parse Filters
  const page = Math.max(1, Number(getSingle(searchParams.p)) || 1);
  const limit = 20;
  const skip = (page - 1) * limit;

  const startDateStr = getSingle(searchParams.sd);
  const endDateStr = getSingle(searchParams.ed);
  const account = getSingle(searchParams.a) as AccountType | "ALL" | undefined;
  const query = getSingle(searchParams.q);

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (startDateStr) {
    startDate = new Date(startDateStr);
  }
  if (endDateStr) {
    endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);
  }

  // 2. Build Query
  const where: any = {
    organizationId: orgId,
  };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lte = endDate;
  }

  if (account && account !== "ALL") {
    where.impactedAccount = account;
  }

  if (query) {
    where.description = { contains: query, mode: "insensitive" };
  }

  try {
    // 3. Fetch Data
    const [organization, transactions, totalCount] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: orgId },
        select: {
          currentCashBalance: true,
          currentBankBalance: true,
        },
      }),
      prisma.transactionHistory.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { name: true } },
        },
      }),
      prisma.transactionHistory.count({ where }),
    ]);

    if (!organization) redirect("/login");

    // 4. Serialize for Client
    const serializedTransactions = transactions.map((t) => ({
      id: t.id,
      date: t.date.toISOString(),
      type: t.type,
      description: t.description || "",
      account: t.impactedAccount,
      debit: Number(t.debitAmount),
      credit: Number(t.creditAmount),
      balanceAfter: Number(t.balanceAfter),
      createdBy: t.user.name,
    }));

    const stats = {
      cashBalance: Number(organization.currentCashBalance),
      bankBalance: Number(organization.currentBankBalance),
    };

    return (
      <AccountsClient
        initialTransactions={serializedTransactions}
        totalCount={totalCount}
        currentPage={page}
        limit={limit}
        stats={stats}
        filters={{
          startDate: startDateStr || "",
          endDate: endDateStr || "",
          account: account || "ALL",
          query: query || "",
        }}
      />
    );
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    return (
      <AccountsClient
        initialTransactions={[]}
        totalCount={0}
        currentPage={1}
        limit={limit}
        stats={{ cashBalance: 0, bankBalance: 0 }}
        error="Failed to load account data. Please check your filters."
        filters={{
          startDate: startDateStr || "",
          endDate: endDateStr || "",
          account: account || "ALL",
          query: query || "",
        }}
      />
    );
  }
}
