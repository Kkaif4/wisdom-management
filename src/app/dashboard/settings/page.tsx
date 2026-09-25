"use client";

import React, { useEffect, useState } from "react";
import { showToast } from "@/components/shared/Toast";
import { Building, Loader2, Trash2, AlertTriangle } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  openingCashBalance: number;
  openingBankBalance: number;
  currentCashBalance: number;
  currentBankBalance: number;
  isFirstTransactionDone: boolean;
}

export default function SettingsPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [name, setName] = useState("");
  const [openingCash, setOpeningCash] = useState("0");
  const [openingBank, setOpeningBank] = useState("0");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetConfirm, setResetConfirm] = useState("");

  useEffect(() => {
    fetchOrgDetails();
  }, []);

  const fetchOrgDetails = async () => {
    try {
      const res = await fetch("/api/organization");
      if (!res.ok) {
        throw new Error("Failed to fetch organization details");
      }
      const data = await res.json();
      setOrg(data);
      setName(data.name);
      setOpeningCash(String(Number(data.openingCashBalance)));
      setOpeningBank(String(Number(data.openingBankBalance)));
    } catch (error: any) {
      showToast(error.message || "Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("Organization name is required", "error");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        name,
        openingCashBalance: Number(openingCash),
        openingBankBalance: Number(openingBank),
      };

      const res = await fetch("/api/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save settings");
      }

      const updated = await res.json();
      setOrg(updated);
      showToast("Organization settings saved successfully", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
          <p className="font-bold">Failed to load organization settings.</p>
          <button
            onClick={fetchOrgDetails}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl space-y-8 animate-fade-in mb-10">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
          Organization Settings
        </h1>
        <p className="text-sm font-medium text-muted-foreground mt-1">
          Manage your institution identity and ledger configurations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Identity Details */}
        <div className="bg-white dark:bg-zinc-900 border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" />
            Identity
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">
                Institution Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-card border border-border/60 rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
                placeholder="Enter organization name"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Settings
          </button>
        </div>
      </form>

      {/* Developer Tools */}
      <div className="border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 space-y-4 bg-rose-50/50 dark:bg-rose-950/10">
        <h3 className="text-sm font-black uppercase tracking-widest text-rose-600 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Developer Tools
        </h3>
        <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">
          Danger zone. This will permanently delete all students, enrollments, receipts, expenses, and transaction history for this organization. Balances will reset to opening values.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-rose-700 mb-1 uppercase tracking-widest">
              Type <span className="font-mono bg-rose-100 dark:bg-rose-900/40 px-1.5 py-0.5 rounded">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={resetConfirm}
              onChange={(e) => setResetConfirm(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-800 rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
          <button
            type="button"
            disabled={resetting || resetConfirm !== "DELETE"}
            onClick={async () => {
              if (resetConfirm !== "DELETE") return;
              setResetting(true);
              try {
                const res = await fetch("/api/debug/reset-org-data", { method: "DELETE" });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                showToast("All organization data wiped successfully.", "success");
                setResetConfirm("");
              } catch (err: any) {
                showToast(err.message || "Failed to reset data", "error");
              } finally {
                setResetting(false);
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {resetting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {resetting ? "Wiping Data…" : "Wipe All Organization Data"}
          </button>
        </div>
      </div>
    </div>
  );
}
