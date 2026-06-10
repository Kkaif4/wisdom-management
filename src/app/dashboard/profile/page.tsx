import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      role: true,
      organization: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const serializedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: user.isActive,
    roleName: user.role.name,
    organizationName: user.organization?.name || "None",
    createdAt: user.createdAt.toISOString(),
  };

  return <ProfileClient user={serializedUser} />;
}
