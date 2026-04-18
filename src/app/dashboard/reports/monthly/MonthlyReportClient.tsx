"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Printer } from "lucide-react";
import { ExcelService } from "@/modules/document/services/excel.service";
import { showToast } from "@/components/shared/Toast";

interface MonthlyStats {
  totalIncome: number;
  totalExpense: number;
  currentFunds: number;
}

interface MonthlyReportClientProps {
  month: number;
  year: number;
  stats: MonthlyStats;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const fmt = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);

export function MonthlyReportClient({
  month,
  year,
  stats,
}: MonthlyReportClientProps) {
  const router = useRouter();
  const net = stats.totalIncome - stats.totalExpense;

  const handleMonthChange = (newMonth: number) => {
    router.push(`/dashboard/reports/monthly?month=${newMonth}&year=${year}`);
  };

  const handleExportExcel = async () => {
    try {
      type SummaryRow = {
        metric: string;
        amount: number;
      };
      const summaryData: SummaryRow[] = [
        { metric: "Total Revenue", amount: stats.totalIncome },
        { metric: "Total Expenditure", amount: stats.totalExpense },
        { metric: "Net Position", amount: net },
        { metric: "Current Liquidity", amount: stats.currentFunds },
      ];

      await ExcelService.export({
        data: summaryData,
        columns: [
          { key: "metric", label: "Metric", format: "text", width: 30 },
          { key: "amount", label: "Amount", format: "currency", width: 20 },
        ],
        fileName: `monthly_report_${months[month]}_${year}`,
        options: {
          sheetName: "Monthly Summary",
          headerStyle: { fillColor: "111827", fontColor: "FFFFFF", bold: true },
        },
      });
      showToast("Excel report generated", "success");
    } catch (err) {
      showToast("Failed to export Excel", "error");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/reports"
          className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
        >
          ← Back to Reports
        </Link>
        <div className="flex items-center gap-3">
          <select
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:outline-none"
            value={month}
            onChange={(e) => handleMonthChange(parseInt(e.target.value))}
          >
            {months.map((m, idx) => (
              <option key={m} value={idx}>
                {m}
              </option>
            ))}
          </select>
          <button
            onClick={handleExportExcel}
            className="p-2.5 rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-zinc-200 transition-all active:scale-95"
            title="Download Excel"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="text-center space-y-2 border-b pb-8 border-zinc-200">
        <h1 className="text-xl font-black uppercase tracking-[0.2em]">
          Wisdom Management System
        </h1>
        <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">
          Monthly Profit & Loss Summary
        </p>
        <p className="text-lg font-mono">
          {months[month]} {year}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="rounded-3xl border p-8 space-y-4"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
            Total Revenue
          </p>
          <p className="text-4xl font-black">{fmt(stats.totalIncome)}</p>
          <div className="h-1 w-12 bg-emerald-500"></div>
          <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
            Sum of all active fee collection receipts for this period.
          </p>
        </div>

        <div
          className="rounded-3xl border p-8 space-y-4"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-red-600">
            Total Expenditure
          </p>
          <p className="text-4xl font-black">{fmt(stats.totalExpense)}</p>
          <div className="h-1 w-12 bg-red-500"></div>
          <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
            Record of all academic and operational expenses paid via Cash/Bank.
          </p>
        </div>

        <div className="rounded-3xl border p-8 space-y-4 bg-zinc-900 text-white border-black shadow-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
            Net Position
          </p>
          <p
            className={`text-4xl font-black ${net < 0 ? "text-red-400" : "text-white"}`}
          >
            {fmt(net)}
          </p>
          <div
            className={`h-1 w-12 ${net < 0 ? "bg-red-400" : "bg-emerald-400"}`}
          ></div>
          <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
            Tactical surplus or deficit for the selected month.
          </p>
        </div>
      </div>

      <div className="mt-12 p-8 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-zinc-900">
            Current Total Liquidity
          </p>
          <p className="text-xs text-zinc-500">
            Includes all current Cash + Bank balances
          </p>
        </div>
        <p className="text-2xl font-black text-emerald-600">
          {fmt(stats.currentFunds)}
        </p>
      </div>
    </div>
  );
}
