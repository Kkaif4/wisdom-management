"use client";

import React, { useState } from "react";

interface BankTransferModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const BankTransferModal: React.FC<BankTransferModalProps> = ({
  onSuccess,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "CASH_DEPOSIT", // or CASH_WITHDRAWAL
    amount: "",
    date: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6 bg-blue-50 border-b border-blue-100">
            <h2 className="text-xl font-bold text-blue-800">Bank Transfer</h2>
            <p className="text-sm text-blue-600">
              Move funds between Internal Accounts
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Transfer Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, type: "CASH_DEPOSIT" })
                  }
                  className={`py-2 px-3 rounded-lg border text-sm font-bold transition ${
                    formData.type === "CASH_DEPOSIT"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Cash to Bank
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, type: "CASH_WITHDRAWAL" })
                  }
                  className={`py-2 px-3 rounded-lg border text-sm font-bold transition ${
                    formData.type === "CASH_WITHDRAWAL"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Bank to Cash
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                required
                placeholder="0.00"
                className="w-full p-2 border rounded-lg font-mono text-lg"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
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
                Remarks
              </label>
              <textarea
                placeholder="Reference info..."
                className="w-full p-2 border rounded-lg h-20"
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
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
              className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Authorize Transfer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
