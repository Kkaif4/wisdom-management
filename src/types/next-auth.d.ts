import { SystemRole } from "@/prisma/generated";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    organizationId?: string;
    role?: SystemRole;
  }

  interface Session {
    user: {
      organizationId?: string;
      role?: SystemRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    organizationId?: string;
    role?: SystemRole;
  }
}
