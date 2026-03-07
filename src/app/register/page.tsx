"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { showToast } from "@/components/shared/Toast";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    orgName: "",
    name: "",
    email: "",
    password: "",
    openingCash: "",
    openingBank: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiClient("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      showToast("Organization created successfully!", "success");

      // After successful registration, redirect to login
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 py-12">
        <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-zinc-200">
          <div className="p-8 pt-12 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-2xl font-black text-white italic tracking-tighter shadow-xl shadow-black/10">
              W
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Setup Your Organization
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Initialize your school's financial management system
            </p>
          </div>

          <div className="p-8 pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-center text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <div className="col-span-full">
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                    School / Organization Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
                    placeholder="e.g. Wisdom Global School"
                    value={formData.orgName}
                    onChange={(e) =>
                      setFormData({ ...formData, orgName: e.target.value })
                    }
                  />
                </div>

                <div className="col-span-full">
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
                    placeholder="admin@school.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>

                <div className="col-span-full border-t border-zinc-100 pt-6 mt-2">
                  <h3 className="text-sm font-black uppercase text-zinc-800 tracking-tighter mb-4 italic">
                    Critical: Opening Balances
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                    Current Cash Balance (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    className="w-full rounded-xl border border-zinc-200 bg-green-50/50 p-3 text-sm font-mono focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 transition-all"
                    value={formData.openingCash}
                    onChange={(e) =>
                      setFormData({ ...formData, openingCash: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                    Current Bank Balance (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    className="w-full rounded-xl border border-zinc-200 bg-blue-50/50 p-3 text-sm font-mono focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                    value={formData.openingBank}
                    onChange={(e) =>
                      setFormData({ ...formData, openingBank: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-xs text-amber-800 leading-relaxed shadow-sm">
                <span className="font-bold uppercase tracking-widest block mb-1">
                  Financial Disclaimer
                </span>
                Registration will finalize your accounts. Opening balances can
                only be set once. Ensure they match your physical cash and bank
                statements.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-black py-4 text-sm font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 active:scale-95 shadow-xl shadow-black/10 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading
                  ? "Initializing Ledger..."
                  : "Create Organization & Register Admin"}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-zinc-100 pt-6">
              <p className="text-sm text-zinc-500">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="font-bold text-black hover:underline underline-offset-4"
                >
                  Sign In
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
