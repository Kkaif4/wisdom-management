import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academic Management | Wisdom Finance",
  description: "Manage classes, school divisions, and academic sessions with strict lifecycle controls.",
};

export default function AcademicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
