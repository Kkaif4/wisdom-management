import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReportsClient } from "./ReportsClient";

export const metadata = {
  title: "Financial Reports | Wisdom Management",
  description: "View financial summaries and transaction details.",
};

export default async function ReportsPage() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/10 p-6 md:p-8 pt-24 lg:pt-8 w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <ReportsClient />
      </div>
    </div>
  );
}
