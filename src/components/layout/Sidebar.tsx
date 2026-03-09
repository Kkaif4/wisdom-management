"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Receipt,
  Wallet,
  Library,
  LogOut,
  Settings,
  ChevronRight,
  TrendingUp,
  X,
  BarChart3,
  ChevronDown,
  FileText,
  CreditCard,
  Building2,
  CalendarDays,
  Landmark,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Receipts", href: "/dashboard/receipts", icon: Receipt },
  { label: "Expenses", href: "/dashboard/expenses", icon: TrendingUp },
  { label: "Students", href: "/dashboard/students", icon: Users },
  { label: "Accounts", href: "/dashboard/accounts", icon: Wallet },
  { label: "Ledger", href: "/dashboard/ledger", icon: Library },
];

const REPORT_ITEMS = [
  { label: "Overview", href: "/dashboard/reports", icon: BarChart3 },
  { label: "Fee Collections", href: "/dashboard/reports/fees", icon: Receipt },
  {
    label: "Account Ledgers",
    href: "/dashboard/reports/accounts",
    icon: Landmark,
  },
  { label: "Expenses", href: "/dashboard/reports/expenses", icon: TrendingUp },
  {
    label: "Adjustments",
    href: "/dashboard/reports/adjustments",
    icon: FileText,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isReportsOpen, setIsReportsOpen] = React.useState(
    pathname.startsWith("/dashboard/reports"),
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-[280px] flex flex-col border-r bg-card/80 backdrop-blur-xl transition-all duration-300 z-50 shadow-sm
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 rotate-3 group hover:rotate-0 transition-transform cursor-pointer">
              <span className="text-xl font-bold text-primary-foreground">
                W
              </span>
            </div>
            <div>
              <p className="text-lg font-black tracking-tighter text-foreground leading-none">
                Wisdom
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80 mt-1">
                Finance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
          <div className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose?.()}
                  className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-all duration-200 ${
                    isActive
                      ? "text-primary bg-primary/10 font-bold shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`h-5 w-5 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                    />
                    <span className="tracking-tight">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
                </Link>
              );
            })}

            {/* Reports Dropdown */}
            <div className="space-y-1">
              <button
                onClick={() => setIsReportsOpen(!isReportsOpen)}
                className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition-all duration-200 ${
                  pathname.startsWith("/dashboard/reports")
                    ? "text-primary bg-primary/5 font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5" />
                  <span className="tracking-tight">Reports</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isReportsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isReportsOpen && (
                <div className="pl-4 space-y-1 mt-1 border-l-2 border-primary/10 ml-6">
                  {REPORT_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => onClose?.()}
                        className={`block rounded-lg px-4 py-2 text-xs transition-all duration-200 ${
                          isActive
                            ? "text-primary bg-primary/10 font-bold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 px-2">
            <div className="h-px bg-border/50 w-full mb-8" />
            <Link
              href="/dashboard/settings"
              onClick={() => onClose?.()}
              className="group flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </div>
        </nav>

        {/* Footer Profile/SignOut Section */}
        <div className="border-t border-border/50 p-4 bg-muted/30">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/10 group focus:outline-none focus:ring-2 focus:ring-destructive/20"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-border group-hover:bg-destructive/10 group-hover:border-destructive/20 transition-colors">
              <LogOut className="h-4 w-4" />
            </div>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
