"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "./actions";
import { showToast } from "@/components/shared/Toast";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 3. Use server action login flow
      const result = await loginAction({ email, password });

      if (result.success) {
        showToast("Login successful! Redirecting...", "success");
        // 8. Ensure login success redirects to /dashboard
        router.push("/dashboard");
        router.refresh();
      } else {
        // 4. Update login page to display errors
        setError(result.error || "Invalid email or password");
        showToast(result.error || "Invalid email or password", "error");
      }
    } catch (err) {
      const message = "An unexpected error occurred. Please try again.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
        <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-zinc-200">
          <div className="p-8 pt-12 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-2xl font-black text-white italic tracking-tighter shadow-xl shadow-black/10">
              W
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Log in to manage your school&apos;s ledger
            </p>
          </div>

          <div className="p-8 pt-0">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 4. Display local error message */}
              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-center text-sm font-medium text-red-600">
                  {error === "Invalid email or password"
                    ? "Incorrect email or password"
                    : error}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
                  placeholder="admin@wisdom.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-xl bg-black py-3 text-sm font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Authenticating..." : "Sign In"}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-zinc-100 pt-6">
              <p className="text-sm text-zinc-500">
                Don&apos;t have an organization account?{" "}
                <a
                  href="/register"
                  className="font-bold text-black hover:underline underline-offset-4"
                >
                  Register Your School
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
