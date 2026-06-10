import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School Expenses | Wisdom Finance",
  description: "Record and manage administrative expenses, cash outflows, vendor payments, and category breakdowns.",
};

export default function ExpensesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
