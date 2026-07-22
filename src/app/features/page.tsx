import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import {
  ArrowRight,
  Database,
  ShieldCheck,
  BarChart4,
  Layers,
  CheckCircle2,
  Activity,
  LayoutDashboard,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Core Capabilities & Features | Wisdom Finance",
  description:
    "Explore the technical architecture, atomic ledgers, multi-tenant data isolation, and verified audits built into Wisdom Finance.",
};

export default async function FeaturesPage() {
  const session = await auth();
  const isLoggedIn = !!session;

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans selection:bg-primary/20">
      {/* Background Grid */}
      <div className="fixed inset-0 z-[-1] bg-[linear-gradient(to_right,#8080800d_1px,transparent_1px),linear-gradient(to_bottom,#8080800d_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"></div>

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden border border-zinc-100 bg-white p-0.5">
                <Image
                  src="/icon.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-bold tracking-tight text-foreground uppercase flex items-baseline text-sm sm:text-lg">
                Wisdom
                <span className="font-mono text-[8px] sm:text-[10px] ml-1 sm:ml-2 text-muted-foreground tracking-widest hidden sm:inline-block">
                  FINANCE_OS
                </span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest">
            <Link
              href="/features"
              aria-label="Features Page"
              className="text-foreground border-b-2 border-primary min-h-[48px] flex items-center px-2"
            >
              Capabilities
            </Link>
            <Link
              href="/faq"
              aria-label="FAQ Page"
              className="text-muted-foreground hover:text-foreground transition-colors min-h-[48px] flex items-center px-2"
            >
              FAQ
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              aria-label={isLoggedIn ? "Open Dashboard" : "Sign In to system"}
              className="flex min-h-[44px] md:min-h-[48px] items-center px-2 md:px-4 font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
            >
              {isLoggedIn ? (
                <>
                  <LayoutDashboard className="h-3 w-3 mr-2 text-primary" />
                  <span className="hidden sm:inline">[ System_Dashboard ]</span>
                  <span className="sm:hidden">[ Dashboard ]</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">[ Auth_Sign_In ]</span>
                  <span className="sm:hidden">[ Auth_Login ]</span>
                </>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-32 pb-32">
        <section className="mx-auto max-w-7xl px-6 animate-fade-in-up">
          <div className="border-l-2 border-primary pl-4 mb-8">
            <span className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Technical Overview
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-tighter text-foreground md:text-6xl uppercase mb-12">
            System Specifications & Capabilities
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-border pt-12">
            <div className="lg:col-span-2 space-y-16">
              {[
                {
                  title: "1. Atomic Ledgers & Precision Mathematics",
                  icon: Database,
                  details: [
                    "Engineered with strict PostgreSQL Decimal fields to enforce 2-decimal arithmetic precision without floating-point overflow or rounding issues.",
                    "Automated double-entry reconciliation flow between physical cash drawers and digital bank deposits.",
                    "Comprehensive tracking of all Student Enrollments, mapped dynamically to academic sessions, classes, and divisions.",
                  ],
                },
                {
                  title: "2. Immutable Audit Logging & Accountability",
                  icon: ShieldCheck,
                  details: [
                    "Automatic logging of all core actions (student creation, CSV importing, fee adjustments, and receipt cancellations).",
                    "Logs capture previous state, new state, operating user, IP addresses, and timestamps to ensure compliance.",
                    "Non-destructive audit architecture: historical details are preserved even as student promotions or session closures occur.",
                  ],
                },
                {
                  title: "3. Enterprise Multi-Tenant Data Isolation",
                  icon: Layers,
                  details: [
                    "Tenant isolation enforces database query boundaries per organization.",
                    "Role-Based Access Control (RBAC) provides precise permission checks (e.g., VIEW_RECEIPTS, EDIT_STUDENT, IMPORT_STUDENTS).",
                    "Secure auth flow via NextAuth with cryptographically signed tokens.",
                  ],
                },
              ].map((group, idx) => (
                <div key={idx} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <group.icon className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-bold uppercase tracking-tight text-foreground">
                      {group.title}
                    </h2>
                  </div>
                  <ul className="space-y-3 pl-9 list-disc text-muted-foreground text-sm md:text-base leading-relaxed">
                    {group.details.map((detail, dIdx) => (
                      <li key={dIdx}>{detail}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Sidebar Specifications */}
            <div className="border-l border-border pl-8 space-y-8 hidden lg:block">
              <div className="border border-border bg-card p-6 rounded-2xl relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary -translate-x-[1px] -translate-y-[1px]" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary translate-x-[1px] -translate-y-[1px]" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary -translate-x-[1px] translate-y-[1px]" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary translate-x-[1px] translate-y-[1px]" />

                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-4 border-b border-border pb-2">
                  System Schematics
                </span>

                <div className="space-y-4 text-xs font-mono">
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Framework</span>
                    <span className="text-foreground">Next.js 16 (App Router)</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Database</span>
                    <span className="text-foreground">PostgreSQL</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">ORM</span>
                    <span className="text-foreground">Prisma Client</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Auth Engine</span>
                    <span className="text-foreground">NextAuth v5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Style Library</span>
                    <span className="text-foreground">Tailwind CSS v4</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col md:flex-row items-start lg:items-center justify-between gap-12">
          <div className="flex flex-col gap-2">
            <span className="text-2xl font-black uppercase tracking-tighter text-foreground">
              Wisdom
            </span>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              SYS.VER.2.4.0 // SECURE FINANCIAL ENGINE
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-12 lg:gap-24">
            <div className="flex flex-col gap-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
                Index
              </span>
              <Link
                href="/"
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                Home
              </Link>
              <Link
                href="/features"
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                Capabilities
              </Link>
              <Link
                href="/faq"
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                FAQ
              </Link>
              <Link
                href="/privacy"
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                Privacy Policy
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
                Actions
              </span>
              <Link
                href={isLoggedIn ? "/dashboard" : "/login"}
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground min-h-[44px] sm:min-h-0 flex items-center"
              >
                {isLoggedIn ? "System Dashboard" : "Authenticate"}
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border py-6 px-6 text-center md:text-left">
          <div className="mx-auto max-w-7xl font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            © {new Date().getFullYear()} Wisdom Management Systems. Strictly Confidential Operations.
          </div>
        </div>
      </footer>
    </div>
  );
}
