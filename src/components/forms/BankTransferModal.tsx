"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ArrowLeftRight,
  Wallet,
  Building2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { DatePicker } from "../ui/date-picker";

interface BankTransferModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const BankTransferModal: React.FC<BankTransferModalProps> = ({
  onSuccess,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: "CASH_DEPOSIT", // or CASH_WITHDRAWAL
    amount: "",
    date: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Clear error on form data change
  useEffect(() => {
    if (error) setError(null);
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Please enter a valid positive amount");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl border border-border/50 overflow-hidden flex flex-col max-h-[90vh]">
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-border/50 flex items-center justify-between bg-blue-500/5">
            <div>
              <h2 className="text-xl font-black text-foreground">
                Bank Transfer
              </h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                Move funds between internal accounts
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors border border-border/50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            {error && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              </div>
            )}

            {/* Transfer Direction Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Transfer Direction
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, type: "CASH_DEPOSIT" })
                  }
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    formData.type === "CASH_DEPOSIT"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border/50 hover:border-border"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <ArrowLeftRight className="h-3 w-3" />
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tight">
                    Cash to Bank
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, type: "CASH_WITHDRAWAL" })
                  }
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    formData.type === "CASH_WITHDRAWAL"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border/50 hover:border-border"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <ArrowLeftRight className="h-3 w-3" />
                    <Wallet className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tight">
                    Bank to Cash
                  </span>
                </button>
              </div>
            </div>

            {/* Common Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    className="w-full bg-muted/30 border border-border/50 rounded-2xl pl-10 pr-4 py-4 text-lg font-black tracking-tight focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Date
                </label>
                <DatePicker
                  value={formData.date}
                  onChange={(val) => setFormData({ ...formData, date: val })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Description / Remarks
              </label>
              <textarea
                placeholder="Reference info..."
                className="w-full bg-muted/30 border border-border/50 rounded-2xl px-4 py-4 font-medium text-sm h-24 focus:outline-none"
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
              />
            </div>

            {/* Validation Hint */}
            <div className="flex items-start gap-2 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-[10px] font-bold text-blue-700 leading-normal uppercase">
                This internal transfer will reconcile balances between your Cash
                Drawer and Bank Account automatically.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 md:p-8 bg-muted/20 border-t border-border/50 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 py-4 text-sm font-black uppercase tracking-widest text-muted-foreground hover:bg-muted rounded-2xl transition-colors border border-border/50 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-[2] py-4 bg-primary text-primary-foreground rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Authorize Transfer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
