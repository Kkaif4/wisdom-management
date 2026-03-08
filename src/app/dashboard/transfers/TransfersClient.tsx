"use client";

import { BankTransferModal } from "@/components/forms/BankTransferModal";
import React, { useState } from "react";
import {
  ArrowLeftRight,
  Plus,
  Calendar,
  ArrowDownCircle,
  ArrowUpCircle,
  FileClock,
  Info,
  History,
} from "lucide-react";

interface Transfer {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  balanceAfter: number;
  account: string;
}

const fmt = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

export function TransfersClient({
  transfers: initial,
  error,
}: {
  transfers: Transfer[];
  error?: string;
}) {
  const [transfers, setTransfers] = useState(initial);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Internal Transfers
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
            <ArrowLeftRight className="h-4 w-4 text-primary" />
            Move funds between Cash and Bank accounts
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          New Transfer
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold flex items-center gap-3 animate-shake">
          <Info className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="glass rounded-3xl overflow-hidden border-border/50">
        <div className="px-8 py-6 border-b border-border/50 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileClock className="h-4 w-4 text-foreground/70" />
            <h2 className="text-sm font-black uppercase tracking-widest text-foreground">
              Transfer History
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70 bg-muted/5">
                <th className="px-8 py-5">Execution Date</th>
                <th className="px-8 py-5">Type</th>
                <th className="px-8 py-5">Reason / Details</th>
                <th className="px-8 py-5 text-right">Transaction Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <History className="h-10 w-10 mb-4" />
                      <p className="text-sm font-bold tracking-tight">
                        No transfer records found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                transfers.map((t) => (
                  <tr
                    key={t.id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground/80">
                        <Calendar className="h-3.5 w-3.5 text-primary/60" />
                        {new Date(t.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        {t.type === "CASH_DEPOSIT" ? (
                          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 px-3 py-1 rounded-full border border-emerald-500/20">
                            <ArrowDownCircle className="h-3 w-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                              Deposit
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-700 px-3 py-1 rounded-full border border-blue-500/20">
                            <ArrowUpCircle className="h-3 w-3" />
                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                              Withdrawal
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <Info className="h-3.5 w-3.5 text-muted-foreground/40" />
                        <p className="text-sm font-bold text-foreground/80 lowercase first-letter:uppercase">
                          {t.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right font-mono font-black text-foreground">
                      {fmt(t.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <BankTransferModal
          onClose={() => setShowModal(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}
