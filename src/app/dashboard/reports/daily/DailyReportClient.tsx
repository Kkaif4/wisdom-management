"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, Printer } from "lucide-react";
import { ExcelService } from "@/modules/document/services/excel.service";
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

  const handleExportExcel = async () => {
    try {
      await ExcelService.export({
        data: receipts,
        columns: [
          { key: "receiptNumber", label: "Receipt #", format: "text" },
          { key: "studentName", label: "Student Name", format: "text" },
          { key: "studentClass", label: "Class", format: "text" },
          { key: "paymentMode", label: "Mode", format: "text" },
          { key: "amount", label: "Amount", format: "currency" },
          { key: "status", label: "Status", format: "text" },
        ],
        fileName: `daily_report_${date}`,
        options: {
          sheetName: "Daily Collection",
          headerStyle: { fillColor: "111827", fontColor: "FFFFFF", bold: true },
        },
      });
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
        </div>
      </div>

      {/* Report Header (Legacy visible header kept for now as it's part of screen UI too, but print styles removed) */}
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
    </div>
  );
}
