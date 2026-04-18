"use client";

import React, { useState } from "react";
import { ReportLayout } from "@/components/dashboard/reports/ReportLayout";
import { ReportFilters } from "@/components/dashboard/reports/ReportFilters";
import { DataTable } from "@/components/dashboard/reports/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { ExcelService } from "@/modules/document/services/excel.service";
import { formatCurrency } from "@/lib/reportExport";
import {
  Wallet,
  Building2,
  TrendingUp,
  TrendingDown,
  Landmark,
  ArrowRightLeft,
} from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  type: string;
  description: string;
  debit: number;
  credit: number;
  balanceAfter: number;
  account: string;
}

interface AccountData {
  openingBalance: number;
  transactions: Transaction[];
  totalInflow: number;
  totalOutflow: number;
  closingBalance: number;
}

interface MultiAccountData {
  CASH?: AccountData;
  BANK?: AccountData;
}

export function AccountsClient() {
  const [data, setData] = useState<MultiAccountData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeAccount, setActiveAccount] = useState<"CASH" | "BANK">("CASH");
  const [filters, setFilters] = useState({ start: "", end: "" });

  const fetchReport = async (start: string, end: string, mode: string) => {
    setLoading(true);
    try {
      // mode in API is 'accountType'
      const res = await fetch(
        `/api/reports/accounts?startDate=${start}&endDate=${end}&accountType=${mode}`,
      );
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        // If mode was ALL, we default to showing CASH transactions first but summaries for both are available
        if (mode !== "ALL") {
          setActiveAccount(mode as any);
        }
      }
    } catch (err) {
      console.error("Failed to fetch account report:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentAccountData = data ? data[activeAccount] : null;

  const handleExport = async () => {
    if (!data) return;
    // Export the currently-viewed account's transactions
    const accData = data[activeAccount];
    if (!accData) return;

    type TxRow = {
      date: string;
      type: string;
      description: string;
      inflow: number;
      outflow: number;
      balance: number;
    };
    const rows: TxRow[] = accData.transactions.map((t: Transaction) => ({
      date: t.date,
      type: t.type.replace(/_/g, " "),
      description: t.description,
      inflow: t.debit,
      outflow: t.credit,
      balance: t.balanceAfter,
    }));

    await ExcelService.export({
      data: rows,
      columns: [
        { key: "date", label: "Date", format: "date" },
        { key: "type", label: "Type", format: "text" },
        { key: "description", label: "Description", format: "text", width: 40 },
        { key: "inflow", label: "Inflow (Dr)", format: "currency" },
        { key: "outflow", label: "Outflow (Cr)", format: "currency" },
        { key: "balance", label: "Balance", format: "currency" },
      ],
      fileName: `${activeAccount}_Account_Ledger`,
      options: {
        sheetName: `${activeAccount} Ledger`,
        headerStyle: { fillColor: "4F46E5", fontColor: "FFFFFF", bold: true },
      },
    });
  };

  const columns: ColumnDef<Transaction>[] = [
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
        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap">
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
      title="Account Ledgers"
      description="Consolidated cash book and bank statement analysis."
      onExportExcel={handleExport}
      isLoading={loading}
      hasData={!!data}
    >
      <div className="space-y-8">
        <ReportFilters
          onRangeChange={(s, e, r) => {
            setFilters({ start: s, end: e });
            fetchReport(s, e, "ALL");
          }}
          onPaymentModeChange={(m) =>
            fetchReport(filters.start, filters.end, m)
          }
          isLoading={loading}
        />

        {data && (
          <>
            {/* Account Switcher / Summaries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cash Summary Card */}
              {data.CASH && (
                <button
                  onClick={() => setActiveAccount("CASH")}
                  className={`text-left p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group ${
                    activeAccount === "CASH"
                      ? "bg-card border-emerald-500/50 shadow-xl shadow-emerald-500/5 scale-[1.01]"
                      : "bg-muted/30 border-transparent hover:bg-muted/50"
                  }`}
                >
                  {activeAccount === "CASH" && (
                    <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${activeAccount === "CASH" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}
                    >
                      <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest opacity-60">
                        Physical Cash
                      </h3>
                      <p className="text-xl font-black">
                        {formatCurrency(data.CASH.closingBalance)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t border-border/50 pt-4">
                    <div>
                      <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">
                        Opening
                      </p>
                      <p className="text-xs font-bold">
                        {formatCurrency(data.CASH.openingBalance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">
                        Inflow
                      </p>
                      <p className="text-xs font-black text-emerald-600">
                        +{formatCurrency(data.CASH.totalInflow)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">
                        Outflow
                      </p>
                      <p className="text-xs font-black text-rose-600">
                        -{formatCurrency(data.CASH.totalOutflow)}
                      </p>
                    </div>
                  </div>
                </button>
              )}

              {/* Bank Summary Card */}
              {data.BANK && (
                <button
                  onClick={() => setActiveAccount("BANK")}
                  className={`text-left p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group ${
                    activeAccount === "BANK"
                      ? "bg-card border-blue-500/50 shadow-xl shadow-blue-500/5 scale-[1.01]"
                      : "bg-muted/30 border-transparent hover:bg-muted/50"
                  }`}
                >
                  {activeAccount === "BANK" && (
                    <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  )}
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${activeAccount === "BANK" ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"}`}
                    >
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest opacity-60">
                        Bank Account
                      </h3>
                      <p className="text-xl font-black">
                        {formatCurrency(data.BANK.closingBalance)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t border-border/50 pt-4">
                    <div>
                      <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">
                        Opening
                      </p>
                      <p className="text-xs font-bold">
                        {formatCurrency(data.BANK.openingBalance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">
                        Inflow
                      </p>
                      <p className="text-xs font-black text-emerald-600">
                        +{formatCurrency(data.BANK.totalInflow)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">
                        Outflow
                      </p>
                      <p className="text-xs font-black text-rose-600">
                        -{formatCurrency(data.BANK.totalOutflow)}
                      </p>
                    </div>
                  </div>
                </button>
              )}
            </div>

            {currentAccountData && (
              <div className="bg-card rounded-[2.5rem] border border-border/50 shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-3 mb-8 px-2">
                  <ArrowRightLeft className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-black tracking-tight">
                    {activeAccount} Transaction History
                  </h2>
                </div>
                <DataTable
                  columns={columns}
                  data={currentAccountData.transactions}
                />
              </div>
            )}
          </>
        )}
      </div>
    </ReportLayout>
  );
}
