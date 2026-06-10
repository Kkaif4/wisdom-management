import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Financial Ledger | Wisdom Finance",
  description: "Comprehensive financial ledger audit trail tracking cash, bank, and transaction details with total precision.",
};

export default function LedgerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
