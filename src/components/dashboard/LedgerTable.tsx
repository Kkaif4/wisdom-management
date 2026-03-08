import React from "react";
import { Calendar, History, User } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  type: string;
  description: string;
  debitAmount: number | null;
  creditAmount: number | null;
  balanceAfter: number;
  impactedAccount: string;
  createdBy: string;
}

interface LedgerTableProps {
  transactions: Transaction[];
}

export const LedgerTable: React.FC<LedgerTableProps> = ({ transactions }) => {
  const formatCurrency = (val: number | null) =>
    val === null || val === 0
      ? "-"
      : new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(val);

  return (
    <div className="glass rounded-3xl border border-border/50 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-muted/20 text-[10px] font-black uppercase text-muted-foreground/70 tracking-[0.15em] border-b border-border/50">
            <tr>
              <th className="px-8 py-5">Date</th>
              <th className="px-8 py-5">Classification</th>
              <th className="px-8 py-5">Details</th>
              <th className="px-8 py-5">Account</th>
              <th className="px-8 py-5 text-right">Debit (In)</th>
              <th className="px-8 py-5 text-right">Credit (Out)</th>
              <th className="px-8 py-5 text-right">Running Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-8 py-24 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center opacity-40">
                    <History className="h-10 w-10 mb-4" />
                    <p className="text-sm font-bold tracking-tight">
                      No records match your criteria
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground/80">
                      <Calendar className="h-3.5 w-3.5 text-primary/60" />
                      {new Date(tx.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black px-2 py-1 rounded bg-muted/50 text-foreground uppercase tracking-widest border border-border/50 whitespace-nowrap">
                      {tx.type.replace(/_/g, " ")}
                    </span>
                    <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase opacity-60 flex items-center gap-1">
                      <User className="h-2 w-2" />
                      BY {tx.createdBy}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-foreground/80 lowercase first-letter:uppercase max-w-xs line-clamp-1">
                      {tx.description || "System Automated Entry"}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className={`text-[10px] font-black tracking-widest uppercase ${
                        tx.impactedAccount === "CASH"
                          ? "text-emerald-700"
                          : "text-blue-700"
                      }`}
                    >
                      {tx.impactedAccount}
                    </span>
                  </td>
                  <td
                    className={`px-8 py-5 text-right font-mono font-bold text-sm ${tx.debitAmount && tx.debitAmount > 0 ? "text-emerald-600" : "text-muted-foreground/20"}`}
                  >
                    {tx.debitAmount && tx.debitAmount > 0
                      ? `+${formatCurrency(tx.debitAmount)}`
                      : "-"}
                  </td>
                  <td
                    className={`px-8 py-5 text-right font-mono font-bold text-sm ${tx.creditAmount && tx.creditAmount > 0 ? "text-rose-600" : "text-muted-foreground/20"}`}
                  >
                    {tx.creditAmount && tx.creditAmount > 0
                      ? `-${formatCurrency(tx.creditAmount)}`
                      : "-"}
                  </td>
                  <td className="px-8 py-5 text-right font-mono font-black text-foreground">
                    {formatCurrency(tx.balanceAfter)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
