"use client";
import React, { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { showToast } from "../shared/Toast";
import { X, Receipt, Loader2 } from "lucide-react";
import { DatePicker } from "../ui/date-picker";

const EXPENSE_CATEGORIES = [
  "Salary",
  "Utilities",
  "Loan",
  "Light Bill",
  "Rent",
  "Maintenance",
  "Other",
];

interface ExpenseEntryModalProps {
  onSuccess: (expense: any) => void;
  onClose: () => void;
}

export const ExpenseEntryModal: React.FC<ExpenseEntryModalProps> = ({
  onSuccess,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    paidFrom: "CASH",
    category: "Salary",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiClient("/api/expenses", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      showToast("Expense recorded successfully!", "success");
      setTimeout(() => {
        onSuccess(data);
        onClose();
      }, 1000);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-card border shadow-2xl rounded-3xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-4 sm:p-6 border-b bg-muted/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center">
                <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  Record Expense
                </h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Enter spending details
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 md:p-8 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Expense Category
              </label>
              <select
                required
                className="w-full bg-muted/20 border border-border/50 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full bg-muted/20 border border-border/50 rounded-2xl pl-8 pr-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Paid From
                </label>
                <select
                  required
                  className="w-full bg-muted/20 border border-border/50 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none"
                  value={formData.paidFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, paidFrom: e.target.value })
                  }
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Date
              </label>
              <DatePicker
                value={formData.date}
                onChange={(val) => setFormData({ ...formData, date: val })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Description
              </label>
              <textarea
                required
                placeholder="What was this expense for?"
                className="w-full bg-muted/20 border border-border/50 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium h-20 resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-muted/30 border-t flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 py-3.5 text-sm font-bold text-muted-foreground hover:bg-muted rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-[2] py-3.5 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                "Record Expense"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
