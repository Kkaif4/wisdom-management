import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TransfersClient } from "./TransfersClient";

export default async function TransfersPage() {
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");

  const orgId = session.user.organizationId;

  // Internal transfers are stored as TransactionHistory with specific types
  const transfers = await prisma.transactionHistory.findMany({
    where: {
      organizationId: orgId,
      type: { in: ["CASH_DEPOSIT", "CASH_WITHDRAWAL"] },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const serialized = transfers.map((t) => ({
    id: t.id,
    type: t.type,
    amount: Number(t.debitAmount || t.creditAmount || 0),
    description: t.description || "",
    date: t.createdAt.toISOString(),
    balanceAfter: Number(t.balanceAfter),
    account: t.impactedAccount,
  }));

  return <TransfersClient transfers={serialized} />;
}
