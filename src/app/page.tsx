import Link from "next/link";
import { auth } from "@/auth";
import {
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Database,
  BarChart4,
  CheckCircle2,
  LayoutDashboard,
} from "lucide-react";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session;
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans selection:bg-primary/20">
      {/* Background Grid - Refined Precision element */}
      <div className="fixed inset-0 z-[-1] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Structural Top Navigation - Industrial style, strict borders */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-primary text-primary-foreground font-black tracking-tighter">
              W
            </div>
            <span className="font-bold tracking-tight text-foreground uppercase hidden min-[375px]:flex items-baseline text-sm sm:text-lg">
              Wisdom
              <span className="font-mono text-[8px] sm:text-[10px] ml-1 sm:ml-2 text-muted-foreground tracking-widest hidden sm:inline-block">
                FINANCE_OS
              </span>
            </span>
          </div>

          <div className="hidden items-center gap-6 lg:flex font-mono text-xs uppercase tracking-widest">
            <Link
              href="#capabilities"
              className="text-muted-foreground hover:text-foreground transition-colors min-h-[48px] flex items-center px-2"
            >
              Capabilities
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
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

      <main className="flex-1 pt-24 pb-32">
        {/* Asymmetrical Hero Section */}
        <section className="mx-auto max-w-7xl px-6 pt-12 md:pt-24 lg:pt-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-start">
            {/* Left/Main Column */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-3 border-l-2 border-primary pl-4 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 bg-primary"></span>
                </span>
                <span className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  System Online &middot; v2.4.0
                </span>
              </div>

              <h1 className="text-5xl font-black tracking-tighter text-foreground md:text-7xl lg:text-[6rem] leading-[0.9] uppercase break-words hyphens-auto max-w-full">
                Zero-State <br />
                <span className="text-muted-foreground">Financial</span> <br />
                Control.
              </h1>

              <p className="mt-10 max-w-xl text-base md:text-lg leading-relaxed text-muted-foreground border-l border-border pl-6">
                The institutional-grade financial engine engineered exclusively
                for educational administration. Eliminate manual reconciliation.
                Enforce absolute precision.
              </p>

              <div className="mt-12 w-full flex flex-col sm:flex-row gap-4 border-t border-border pt-8">
                <Link
                  href={isLoggedIn ? "/dashboard" : "/login"}
                  className="group flex min-h-[56px] w-full sm:w-auto items-center justify-between sm:justify-center gap-4 border-2 border-primary bg-primary px-8 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-all hover:bg-background hover:text-primary active:scale-[0.98]"
                >
                  {isLoggedIn ? "Enter Dashboard" : "Initialize Session"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                </Link>
                <Link
                  href="#capabilities"
                  className="flex min-h-[56px] w-full sm:w-auto items-center justify-center gap-2 border border-border bg-card px-8 text-sm font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-muted active:scale-[0.98]"
                >
                  View Schematics
                </Link>
              </div>
            </div>

            {/* Right/Secondary Column - Data-dense visual anchor */}
            <div className="lg:col-span-5 w-full flex justify-center lg:justify-end mt-4 lg:mt-0">
              <div className="w-full max-w-md border border-border bg-card/80 backdrop-blur-md p-6 relative">
                {/* Decorative corner markers */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary -translate-x-[1px] -translate-y-[1px]" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary translate-x-[1px] -translate-y-[1px]" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary -translate-x-[1px] translate-y-[1px]" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary translate-x-[1px] translate-y-[1px]" />

                <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Terminal View
                  </span>
                  <Activity className="h-4 w-4 text-primary" />
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between font-mono text-[10px] uppercase text-muted-foreground mb-2 tracking-wider">
                      <span>Live Ledger Volume</span>
                      <span className="text-emerald-500 font-bold">Active</span>
                    </div>
                    <div className="text-4xl lg:text-5xl font-black tracking-tighter">
                      ₹ 12,450.00
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border border-dashed space-y-3">
                    <div className="flex justify-between items-center text-sm font-mono mb-4">
                      <span className="text-muted-foreground uppercase text-[10px] tracking-wider">
                        Recent Executions
                      </span>
                    </div>
                    {[
                      {
                        id: "TX_8829",
                        amt: "+ 4,200",
                        status: "CLEARED",
                        statusCol: "text-emerald-500",
                      },
                      {
                        id: "TX_8830",
                        amt: "- 1,050",
                        status: "VERIFIED",
                        statusCol: "text-blue-500",
                      },
                      {
                        id: "TX_8831",
                        amt: "+ 9,300",
                        status: "CLEARED",
                        statusCol: "text-emerald-500",
                      },
                      {
                        id: "TX_8832",
                        amt: "- 2,100",
                        status: "PENDING",
                        statusCol: "text-orange-500",
                      },
                    ].map((tx, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-xs font-mono py-2 bg-muted/30 px-3 border-l-2 border-border/50 hover:border-primary transition-colors cursor-default"
                      >
                        <span className="text-muted-foreground w-16">
                          {tx.id}
                        </span>
                        <span className="font-bold flex-1 text-right pr-4">
                          {tx.amt}
                        </span>
                        <span className={`${tx.statusCol} w-20 text-right`}>
                          {tx.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities Section - Structural, Editorial Grid */}
        <section
          id="capabilities"
          className="mx-auto max-w-7xl px-6 mt-32 md:mt-48 scroll-mt-24"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-foreground pb-6 mb-12 lg:mb-16 gap-6">
            <div>
              <h2 className="font-mono text-xs lg:text-sm uppercase tracking-[0.3em] text-primary mb-2">
                System Capabilities
              </h2>
              <p className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase leading-none">
                Technical Architecture
              </p>
            </div>
            <p className="font-mono text-[10px] lg:text-xs uppercase tracking-widest text-muted-foreground max-w-xs md:text-right hidden sm:block">
              Designed for immutable recording and structural integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-border mt-8">
            {[
              {
                title: "Atomic Ledgers",
                icon: Database,
                desc: "High-precision Decimal fields ensure zero rounding errors across all operational records. Complete data isolation per tenant.",
              },
              {
                title: "Immutable Audits",
                icon: ShieldCheck,
                desc: "Every modification, creation, or deletion is logged with absolute certainty. Tamper-evident architecture.",
              },
              {
                title: "Structured Reporting",
                icon: BarChart4,
                desc: "Machine-readable, print-perfect financial outputs formatted for regulatory and administrative review.",
              },
              {
                title: "Deep Isolation",
                icon: Layers,
                desc: "Multi-tenant context ensures distinct organizational boundaries with no overlap in database queries.",
              },
              {
                title: "Instant Verification",
                icon: CheckCircle2,
                desc: "Automated balance checking across cash and bank domains. Immediate discrepancy highlighting.",
              },
              {
                title: "Zero-Latency UI",
                icon: Activity,
                desc: "Server component driven dashboard. Minimal client-side JS ensures maximum operational speed.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group border-r border-b border-border p-8 hover:bg-muted/50 transition-colors cursor-default relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                <feature.icon className="h-6 w-6 text-foreground mb-8 opacity-50 group-hover:opacity-100 transition-opacity relative z-10" />
                <h3 className="text-lg font-bold uppercase tracking-tight text-foreground mb-4 relative z-10">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground relative z-10">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer - Minimal Utilitarian */}
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
                href="#capabilities"
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                Capabilities
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
              {/* <Link
                href="/register"
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground min-h-[44px] sm:min-h-0 flex items-center"
              >
                Initialize Engine
              </Link> */}
            </div>
          </div>
        </div>
        <div className="border-t border-border py-6 px-6 text-center md:text-left">
          <div className="mx-auto max-w-7xl font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            © {new Date().getFullYear()} Wisdom Management Systems. Strictly
            Confidential Operations.
          </div>
        </div>
      </footer>
    </div>
  );
}
