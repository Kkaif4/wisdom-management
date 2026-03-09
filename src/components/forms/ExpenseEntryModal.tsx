"use client";
import React, { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { showToast } from "../shared/Toast";
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
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 bg-red-50 border-b border-red-100">
              <h2 className="text-xl font-bold text-red-800">Record Expense</h2>
              <p className="text-sm text-red-600">
                Enter spending details correctly
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Expense Category
                </label>
                <select
                  required
                  className="w-full p-2 border rounded-lg bg-white"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full p-2 border rounded-lg"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Paid From
                  </label>
                  <select
                    required
                    className="w-full p-2 border rounded-lg bg-white"
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

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full p-2 border rounded-lg"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Description
                </label>
                <textarea
                  required
                  placeholder="What was this for?"
                  className="w-full p-2 border rounded-lg h-20"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {loading ? "Recording..." : "Record Expense"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
