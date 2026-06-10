import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Receipts & Income | Wisdom Finance",
  description: "Track student fees deposits, add receipts, manage cash/bank transactions, and view income logs.",
};

export default function ReceiptsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
