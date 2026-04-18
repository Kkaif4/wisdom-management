"use client";

import React, { useState } from "react";
import { ReportLayout } from "@/components/dashboard/reports/ReportLayout";
import { DateRangePicker } from "@/components/dashboard/reports/DateRangePicker";
import { DataTable } from "@/components/dashboard/reports/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { ExcelService } from "@/modules/document/services/excel.service";
import { formatCurrency } from "@/lib/reportExport";
import { Building2, TrendingUp, TrendingDown, Landmark } from "lucide-react";

interface BankTransaction {
  id: string;
  date: string;
  type: string;
  description: string;
  debit: number;
  credit: number;
  balanceAfter: number;
}

interface BankReportData {
  transactions: BankTransaction[];
  summary: {
    openingBalance: number;
    totalInflow: number;
    totalOutflow: number;
    closingBalance: number;
  };
}

export function BankClient() {
  const [data, setData] = useState<BankReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState({ start: "", end: "" });

  const fetchReport = async (start: string, end: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reports/bank?startDate=${start}&endDate=${end}`,
      );
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch bank report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (start: string, end: string) => {
    setDates({ start, end });
    fetchReport(start, end);
  };

  const handleExport = async () => {
    if (!data) return;
    type TxRow = {
      date: string;
      type: string;
      description: string;
      inflow: number;
      outflow: number;
      balanceAfter: number;
    };
    const rows: TxRow[] = data.transactions.map((t) => ({
      date: t.date,
      type: t.type.replace(/_/g, " "),
      description: t.description,
      inflow: t.debit,
      outflow: t.credit,
      balanceAfter: t.balanceAfter,
    }));
    await ExcelService.export({
      data: rows,
      columns: [
        { key: "date", label: "Date", format: "date" },
        { key: "type", label: "Type", format: "text" },
        { key: "description", label: "Description", format: "text", width: 40 },
        { key: "inflow", label: "Inflow (Dr)", format: "currency" },
        { key: "outflow", label: "Outflow (Cr)", format: "currency" },
        { key: "balanceAfter", label: "Balance After", format: "currency" },
      ],
      fileName: "Bank_Ledger_Report",
      options: {
        sheetName: "Bank Ledger",
        headerStyle: { fillColor: "4F46E5", fontColor: "FFFFFF", bold: true },
      },
    });
  };

  const columns: ColumnDef<BankTransaction>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="font-medium">
          {new Date(row.getValue("date")).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
          {(row.getValue("type") as string).replace(/_/g, " ")}
        </span>
      ),
    },
    { accessorKey: "description", header: "Description" },
    {
      accessorKey: "debit",
      header: () => <div className="text-right">Inflow (Dr)</div>,
      cell: ({ row }) => (
        <div className="text-right font-bold text-emerald-600">
          {row.getValue("debit") ? formatCurrency(row.getValue("debit")) : "—"}
        </div>
      ),
    },
    {
      accessorKey: "credit",
      header: () => <div className="text-right">Outflow (Cr)</div>,
      cell: ({ row }) => (
        <div className="text-right font-bold text-rose-600">
          {row.getValue("credit")
            ? formatCurrency(row.getValue("credit"))
            : "—"}
        </div>
      ),
    },
    {
      accessorKey: "balanceAfter",
      header: () => <div className="text-right">Balance</div>,
      cell: ({ row }) => (
        <div className="text-right font-black text-foreground">
          {formatCurrency(row.getValue("balanceAfter"))}
        </div>
      ),
    },
  ];

  return (
    <ReportLayout
      title="Bank Ledger Report"
      description="View all bank-related transactions and account reconciliation."
      onExportExcel={handleExport}
      isLoading={loading}
      hasData={!!data}
    >
      <div className="space-y-8">
        <DateRangePicker
          onRangeChange={handleRangeChange}
          isLoading={loading}
        />

        {data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col group hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Opening
                  </h3>
                </div>
                <p className="text-2xl font-black text-blue-600">
                  {formatCurrency(data.summary.openingBalance)}
                </p>
              </div>

              <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col group hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Total Inflow
                  </h3>
                </div>
                <p className="text-2xl font-black text-emerald-600">
                  {formatCurrency(data.summary.totalInflow)}
                </p>
              </div>

              <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col group hover:border-rose-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Total Outflow
                  </h3>
                </div>
                <p className="text-2xl font-black text-rose-600">
                  {formatCurrency(data.summary.totalOutflow)}
                </p>
              </div>

              <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col group hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Closing
                  </h3>
                </div>
                <p className="text-2xl font-black text-primary">
                  {formatCurrency(data.summary.closingBalance)}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-6">
              <DataTable columns={columns} data={data.transactions} />
            </div>
          </>
        )}
      </div>
    </ReportLayout>
  );
}
