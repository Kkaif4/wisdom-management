import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CancellationsReportPage() {
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");

  const receipts = await prisma.receipt.findMany({
    where: { organizationId: session.user.organizationId, status: "CANCELLED" },
    include: {
      student: { select: { name: true } },
      createdByUser: { select: { name: true } },
    },
    orderBy: { cancelledAt: "desc" },
    take: 50,
  });

  const fmt = (val: any) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(val));

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/reports"
            className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors mb-2 block"
          >
            ← Back to Reports
          </Link>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Cancellation Audit
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
            Historical log of reversed financial transactions
          </p>
        </div>
      </div>

      <div
        className="rounded-2xl border overflow-hidden bg-white"
        style={{ borderColor: "var(--border)" }}
      >
        <table className="w-full text-left">
          <thead>
            <tr
              className="text-[10px] font-bold uppercase tracking-widest border-b"
              style={{
                color: "var(--text-tertiary)",
                borderColor: "var(--border)",
              }}
            >
              <th className="px-6 py-4">Cancelled Date</th>
              <th className="px-6 py-4">Receipt #</th>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Original Amount</th>
              <th className="px-6 py-4">Remarks / Reason</th>
            </tr>
          </thead>
          <tbody
            className="divide-y"
            style={{ borderColor: "var(--surface-2)" }}
          >
            {receipts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-zinc-400 text-sm"
                >
                  No cancelled receipts found in history.
                </td>
              </tr>
            ) : (
              receipts.map((r) => (
                <tr key={r.id} className="hover:bg-red-50/30 transition-colors">
                  <td className="px-6 py-4 text-xs text-zinc-500 whitespace-nowrap">
                    {r.cancelledAt
                      ? new Date(r.cancelledAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono font-bold text-red-600">
                    {r.receiptNumber}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-zinc-900">
                      {r.student?.name || "N/A"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-zinc-500 line-through">
                    {fmt(r.amount)}
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-600 italic max-w-sm">
                    {r.remarks || "No reason specified"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
