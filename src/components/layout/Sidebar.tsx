"use client";
import Image from "next/image";

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
  BarChart3,
  ChevronDown,
  FileText,
  Landmark,
  School,
  X,
  User,
} from "lucide-react";

import { usePermissions } from "@/hooks/usePermissions";
import { PermissionName } from "@/modules/auth/types/auth.types";

const NAV_ITEMS: {
  label: string;
  href: string;
  icon: any;
  permission: PermissionName;
}[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "VIEW_DASHBOARD",
  },
  {
    label: "Receipts",
    href: "/dashboard/receipts",
    icon: Receipt,
    permission: "VIEW_RECEIPTS_SCREEN",
  },
  {
    label: "Academic",
    href: "/dashboard/academic",
    icon: School,
    permission: "VIEW_FEES_SCREEN",
  },
  {
    label: "Students",
    href: "/dashboard/students",
    icon: Users,
    permission: "VIEW_STUDENTS_SCREEN",
  },
  {
    label: "Withdrawn",
    href: "/dashboard/students/withdrawn",
    icon: Users,
    permission: "VIEW_STUDENTS_SCREEN",
  },
  {
    label: "Expenses",
    href: "/dashboard/expenses",
    icon: TrendingUp,
    permission: "VIEW_EXPENSES_SCREEN",
  },
  {
    label: "Accounts",
    href: "/dashboard/accounts",
    icon: Wallet,
    permission: "VIEW_SETTINGS_SCREEN",
  },
  {
    label: "Ledger",
    href: "/dashboard/ledger",
    icon: Library,
    permission: "VIEW_REPORTS_SCREEN",
  },
];

const REPORT_ITEMS: {
  label: string;
  href: string;
  icon: any;
  permission: PermissionName;
}[] = [
  {
    label: "Overview",
    href: "/dashboard/reports",
    icon: BarChart3,
    permission: "VIEW_REPORTS_SCREEN",
  },
  {
    label: "Income / Receipts",
    href: "/dashboard/reports/fees",
    icon: Receipt,
    permission: "VIEW_FEE_REPORTS",
  },
  {
    label: "Account Ledgers",
    href: "/dashboard/reports/accounts",
    icon: Landmark,
    permission: "VIEW_FINANCIAL_REPORTS",
  },
  {
    label: "Expenses",
    href: "/dashboard/reports/expenses",
    icon: TrendingUp,
    permission: "VIEW_EXPENSE_REPORTS",
  },
  {
    label: "Adjustments",
    href: "/dashboard/reports/adjustments",
    icon: FileText,
    permission: "VIEW_FINANCIAL_REPORTS",
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = React.memo(function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();

  const [isReportsOpen, setIsReportsOpen] = React.useState(
    pathname.startsWith("/dashboard/reports"),
  );

  // Memoize filtered items so they don't recompute on every render
  const visibleNavItems = React.useMemo(
    () => NAV_ITEMS.filter((item) => hasPermission(item.permission)),
    [hasPermission],
  );
  const visibleReportItems = React.useMemo(
    () => REPORT_ITEMS.filter((item) => hasPermission(item.permission)),
    [hasPermission],
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
        id="sidebar"
        className={`fixed left-0 top-0 h-screen w-[280px] flex flex-col border-r bg-card/80 backdrop-blur-xl transition-all duration-300 z-50 shadow-sm no-print
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-md group hover:scale-105 transition-transform cursor-pointer bg-white">
              <Image
                src="/wfm-logo.png"
                alt="Wisdom Finance Logo"
                width={40}
                height={40}
                className="object-contain"
              />
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
            {visibleNavItems.map((item) => {
              const isActive =
                item.href === "/dashboard/students"
                  ? pathname === "/dashboard/students" ||
                    (pathname.startsWith("/dashboard/students/") &&
                      !pathname.includes("/withdrawn"))
                  : pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(item.href));

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
            {visibleReportItems.length > 0 && (
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
                    {visibleReportItems.map((item) => {
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
            )}
          </div>

          <div className="mt-8 px-2 space-y-1">
            <div className="h-px bg-border/50 w-full mb-8" />
            <Link
              href="/dashboard/profile"
              onClick={() => onClose?.()}
              className={`group flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all ${
                pathname === "/dashboard/profile"
                  ? "text-primary bg-primary/10 font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <User className="h-5 w-5" />
              <span>My Profile</span>
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => onClose?.()}
              className={`group flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all ${
                pathname === "/dashboard/settings"
                  ? "text-primary bg-primary/10 font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </div>
        </nav>

        {/* Footer Profile/SignOut Section */}
        <div className="border-t border-border/50 p-4 bg-muted/30">
          <button
            onClick={() => {
              sessionStorage.removeItem("wisdom_splash_shown");
              signOut({ callbackUrl: "/login" });
            }}
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
});
