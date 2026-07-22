import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { LayoutDashboard } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Wisdom Finance",
  description:
    "Find answers to frequently asked questions about Wisdom Finance, including transaction reconciliation, data security, and sheet imports.",
};

export default async function FaqPage() {
  const session = await auth();
  const isLoggedIn = !!session;

  const faqs = [
    {
      q: "How does double-entry reconciliation work in Wisdom Finance?",
      a: "All collections and expenses are categorized and tracked dynamically. Physical cash transactions modify the organization's 'currentCashBalance', while bank operations adjust the 'currentBankBalance' in real-time, preventing reconciliation discrepancies.",
    },
    {
      q: "Can I import existing student records via CSV?",
      a: "Yes. Wisdom Finance features a bulk import wizard that processes student rosters, automatically handles class and division mappings, and sets up initial active enrollments safely.",
    },
    {
      q: "How is data isolated between organizations?",
      a: "The system is built on a robust multi-tenant architecture. Every database query, mutation, and session check is scoped strictly to the authenticated user's 'organizationId' to enforce complete privacy.",
    },
    {
      q: "What security measures are implemented for transactions?",
      a: "Every transaction is mapped to a system audit log entry that records the operating user, the exact properties changed, and metadata to guarantee non-repudiation.",
    },
  ];

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
              className="text-muted-foreground hover:text-foreground transition-colors min-h-[48px] flex items-center px-2"
            >
              Capabilities
            </Link>
            <Link
              href="/faq"
              aria-label="FAQ Page"
              className="text-foreground border-b-2 border-primary min-h-[48px] flex items-center px-2"
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
        <section className="mx-auto max-w-4xl px-6 animate-fade-in-up">
          <div className="border-l-2 border-primary pl-4 mb-8">
            <span className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Support Center
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-tighter text-foreground md:text-5xl uppercase mb-12">
            Frequently Asked Questions
          </h1>

          <div className="border-t border-border/50 divide-y divide-border/50 pt-6">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group py-6 [&_summary::-webkit-details-marker]:hidden" id={`faq-item-${idx}`}>
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-2">
                  <h2 className="text-base font-bold uppercase tracking-tight">
                    {faq.q}
                  </h2>
                  <span className="relative size-5 shrink-0">
                    <span className="absolute inset-0 m-auto h-2.5 w-0.5 bg-foreground transition-transform duration-300 group-open:rotate-90" />
                    <span className="absolute inset-0 m-auto h-0.5 w-2.5 bg-foreground" />
                  </span>
                </summary>
                <p className="mt-4 pl-2 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </details>
            ))}
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
