"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, Printer } from "lucide-react";
import * as XLSX from "xlsx";
import { showToast } from "@/components/shared/Toast";

interface ReceiptEntry {
  id: string;
  receiptNumber: string;
  studentName: string;
  studentClass: string;
  amount: number;
  paymentMode: string;
  status: string;
}

interface DailyReportClientProps {
  initialDate: string;
  receipts: ReceiptEntry[];
}

const fmt = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);

export function DailyReportClient({
  initialDate,
  receipts,
}: DailyReportClientProps) {
  const [date, setDate] = useState(initialDate);
  const router = useRouter();

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    router.push(`/dashboard/reports/daily?date=${newDate}`);
  };

  const handleExportExcel = () => {
    try {
      const headers = [
        "Receipt #",
        "Student Name",
        "Class",
        "Mode",
        "Amount",
        "Status",
      ];
      const rows = receipts.map((r) => [
        r.receiptNumber,
        r.studentName,
        r.studentClass,
        r.paymentMode,
        r.amount,
        r.status,
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Daily Collection");

      XLSX.writeFile(wb, `daily_report_${date}.xlsx`);
      showToast("Excel report generated", "success");
    } catch (err) {
      showToast("Failed to export Excel", "error");
    }
  };

  const cashTotal = receipts
    .filter((r) => r.paymentMode === "CASH" && r.status === "ACTIVE")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const bankTotal = receipts
    .filter((r) => r.paymentMode === "BANK" && r.status === "ACTIVE")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const cancelledTotal = receipts
    .filter((r) => r.status === "CANCELLED")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Controls — Non-printing */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/dashboard/reports"
          className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black"
        >
          ← Back
        </Link>
        <div className="flex items-center gap-3">
          <input
            type="date"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
          />
          <button
            onClick={handleExportExcel}
            className="p-2.5 rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200 transition-all active:scale-95"
            title="Download Excel"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Report Header */}
      <div className="text-center space-y-2 border-b pb-8 border-zinc-200">
        <h1 className="text-xl font-black uppercase tracking-[0.2em]">
          Wisdom Management System
        </h1>
        <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">
          Daily Collection Report
        </p>
        <p className="text-lg font-mono">
          {new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-3 gap-6">
        <div className="text-center p-6 border-r border-dashed border-zinc-200">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
            Cash Collection
          </p>
          <p className="text-xl font-black">{fmt(cashTotal)}</p>
        </div>
        <div className="text-center p-6 border-r border-dashed border-zinc-200">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
            Bank Collection
          </p>
          <p className="text-xl font-black">{fmt(bankTotal)}</p>
        </div>
        <div className="text-center p-6 bg-zinc-50 rounded-2xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 font-black">
            Net Total
          </p>
          <p className="text-2xl font-black text-emerald-600">
            {fmt(cashTotal + bankTotal)}
          </p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="mt-8">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-3 text-[10px] font-black uppercase tracking-widest">
                Receipt
              </th>
              <th className="py-3 text-[10px] font-black uppercase tracking-widest">
                Student / Details
              </th>
              <th className="py-3 text-[10px] font-black uppercase tracking-widest">
                Mode
              </th>
              <th className="py-3 text-right text-[10px] font-black uppercase tracking-widest">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y border-b border-zinc-200">
            {receipts.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-12 text-center text-sm text-zinc-400"
                >
                  No collections recorded for this date.
                </td>
              </tr>
            ) : (
              receipts.map((r) => (
                <tr
                  key={r.id}
                  className={
                    r.status === "CANCELLED"
                      ? "opacity-30 line-through grayscale bg-zinc-50"
                      : ""
                  }
                >
                  <td className="py-4 font-mono text-sm">{r.receiptNumber}</td>
                  <td className="py-4">
                    <p className="text-sm font-bold">{r.studentName}</p>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold">
                      {r.studentClass}
                    </p>
                  </td>
                  <td className="py-4">
                    <span className="text-[10px] font-black">
                      {r.paymentMode}
                    </span>
                  </td>
                  <td className="py-4 text-right font-mono font-bold text-sm">
                    {fmt(r.amount)}
                    {r.status === "CANCELLED" && (
                      <span className="block text-[8px] font-black text-red-600 no-line-through">
                        CANCELLED
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Signature Area — Printing only */}
      <div className="hidden print:flex flex-col items-end mt-24 gap-12">
        <div className="w-48 border-t border-black text-center pt-2">
          <p className="text-[10px] font-black uppercase tracking-widest">
            Authorized Signature
          </p>
        </div>
        <p className="text-[8px] text-zinc-400">
          Computer generated report • {new Date().toLocaleString()}
        </p>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            background: white !important;
          }
          .print\:hidden {
            display: none !important;
          }
          .bg-zinc-50 {
            background: #f9fafb !important;
            -webkit-print-color-adjust: exact;
          }
          .border-zinc-200 {
            border-color: #e5e7eb !important;
          }
          .text-emerald-600 {
            color: #059669 !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th {
            border-bottom: 2px solid black !important;
          }
          td {
            border-bottom: 1px solid #f3f4f6 !important;
          }
        }
      `}</style>
    </div>
  );
}
