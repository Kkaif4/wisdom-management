import React from "react";

interface Transaction {
  id: string;
  date: string;
  type: string;
  description: string;
  debitAmount: number | null;
  creditAmount: number | null;
  balanceAfter: number;
  impactedAccount: string;
}

interface LedgerTableProps {
  transactions: Transaction[];
}

export const LedgerTable: React.FC<LedgerTableProps> = ({ transactions }) => {
  const formatCurrency = (val: number | null) =>
    val === null
      ? "-"
      : new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(val);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 text-lg tracking-tight">
          Unified Transaction Ledger
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-bold uppercase text-gray-400 tracking-widest border-b">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Account</th>
              <th className="px-6 py-4 text-right">Debit (In)</th>
              <th className="px-6 py-4 text-right">Credit (Out)</th>
              <th className="px-6 py-4 text-right">Running Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="hover:bg-gray-50/50 transition-colors group"
              >
                <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                  {new Date(tx.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-700">
                  <span className="block">{tx.description}</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">
                    {tx.type.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-[10px] font-black px-2 py-1 rounded ${
                      tx.impactedAccount === "CASH"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {tx.impactedAccount}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-mono text-green-600">
                  {formatCurrency(tx.debitAmount)}
                </td>
                <td className="px-6 py-4 text-right text-sm font-mono text-red-600">
                  {formatCurrency(tx.creditAmount)}
                </td>
                <td className="px-6 py-4 text-right text-sm font-black text-gray-800 font-mono">
                  {formatCurrency(tx.balanceAfter)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
