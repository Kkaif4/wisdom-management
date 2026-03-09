"use client";

import React from "react";
import Link from "next/link";
import { Download, Printer } from "lucide-react";
import * as XLSX from "xlsx";
import { showToast } from "@/components/shared/Toast";

interface Receipt {
  id: string;
  receiptNumber: string;
  date: string;
  amount: number;
  paymentMode: string;
  status: string;
  remarks: string | null;
}

interface StudentData {
  name: string;
  class: string;
  totalFeesAssigned: number;
  totalPaid: number;
  receipts: Receipt[];
}

const fmt = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);

export function StatementClient({ student }: { student: StudentData }) {
  const remaining = student.totalFeesAssigned - student.totalPaid;

  const handleExportExcel = () => {
    try {
      const summaryData = [
        ["Student Account Statement"],
        ["Student Name", student.name],
        ["Class", student.class],
        ["Generated At", new Date().toLocaleString()],
        [],
        ["Financial Summary"],
        ["Total Fees Assigned", student.totalFeesAssigned],
        ["Total Paid", student.totalPaid],
        ["Remaining Balance", remaining],
        [],
        ["Payment History"],
        ["Date", "Receipt #", "Mode", "Amount", "Status"],
      ];

      const rows = student.receipts.map((r) => [
        new Date(r.date).toLocaleDateString(),
        r.receiptNumber,
        r.paymentMode,
        r.amount,
        r.status,
      ]);

      const ws = XLSX.utils.aoa_to_sheet([...summaryData, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Statement");

      XLSX.writeFile(wb, `statement_${student.name.replace(/\s+/g, "_")}.xlsx`);
      showToast("Statement exported to Excel", "success");
    } catch (err) {
      showToast("Failed to export Excel", "error");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Back nav */}
      <Link
        href="/dashboard/students"
        className="text-xs font-bold uppercase tracking-widest transition-colors hover:opacity-70"
        style={{ color: "var(--text-tertiary)" }}
      >
        ← Back to Students
      </Link>

      {/* Student Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {student.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
            Class: {student.class} · Account Statement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="p-2.5 rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200 transition-all active:scale-95 flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4"
            title="Download Excel"
          >
            <Download className="h-4 w-4" />
            Excel
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:opacity-80 active:scale-95 flex items-center gap-2"
            style={{
              backgroundColor: "var(--surface-2)",
              color: "var(--text-secondary)",
            }}
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className="rounded-2xl p-5 border"
          style={{ borderColor: "var(--border)" }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
            style={{ color: "var(--text-tertiary)" }}
          >
            Assigned
          </p>
          <p
            className="text-xl font-black tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {fmt(student.totalFeesAssigned)}
          </p>
        </div>
        <div
          className="rounded-2xl p-5 border"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--accent-subtle)",
          }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
            style={{ color: "var(--accent-text)" }}
          >
            Paid
          </p>
          <p
            className="text-xl font-black tracking-tight"
            style={{ color: "var(--accent-text)" }}
          >
            {fmt(student.totalPaid)}
          </p>
        </div>
        <div
          className="rounded-2xl p-5 border"
          style={{
            borderColor: remaining > 0 ? "var(--danger)" : "var(--accent)",
            backgroundColor:
              remaining > 0 ? "var(--danger-subtle)" : "var(--accent-subtle)",
          }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1"
            style={{
              color: remaining > 0 ? "var(--danger)" : "var(--accent-text)",
            }}
          >
            Remaining
          </p>
          <p
            className="text-xl font-black tracking-tight"
            style={{
              color: remaining > 0 ? "var(--danger)" : "var(--accent-text)",
            }}
          >
            {fmt(remaining)}
          </p>
        </div>
      </div>

      {/* Receipt History */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--surface-1)",
        }}
      >
        <div
          className="px-6 py-5 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <h2
            className="text-sm font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Payment History
          </h2>
        </div>

        {student.receipts.length === 0 ? (
          <div
            className="px-6 py-12 text-center text-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            No payments recorded yet.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr
                className="text-[10px] font-bold uppercase tracking-[0.12em] border-b"
                style={{
                  color: "var(--text-tertiary)",
                  borderColor: "var(--border)",
                }}
              >
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Receipt #</th>
                <th className="px-6 py-3">Mode</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: "var(--surface-2)" }}
            >
              {student.receipts.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-stone-50/60 transition-colors"
                >
                  <td
                    className="px-6 py-3 text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {new Date(r.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td
                    className="px-6 py-3 text-sm font-mono font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {r.receiptNumber}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`text-[10px] font-black px-2 py-1 rounded ${
                        r.paymentMode === "CASH"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {r.paymentMode}
                    </span>
                  </td>
                  <td
                    className="px-6 py-3 text-right text-sm font-mono font-bold"
                    style={{ color: "var(--accent)" }}
                  >
                    {fmt(r.amount)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded ${
                        r.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            background: white !important;
            font-size: 10pt;
            color: black !important;
          }
          a,
          button,
          .tracking-widest {
            display: none !important;
          }
          .rounded-2xl {
            border-radius: 4px !important;
            border-color: #eee !important;
            box-shadow: none !important;
          }
          .bg-emerald-100,
          .bg-blue-100,
          .bg-red-100 {
            background: transparent !important;
            color: black !important;
            border: 1px solid #ccc !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th,
          td {
            border-bottom: 1px solid #eee !important;
            padding: 10px 4px !important;
          }
          h1 {
            font-size: 24pt !important;
          }
        }
      `}</style>
    </div>
  );
}
