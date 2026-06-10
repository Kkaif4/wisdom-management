import { auth } from "@/auth";
import { OrganizationService } from "@/modules/organizations/organization.service";
import { NextResponse } from "next/server";
import { Prisma } from "@/prisma/generated";

export const GET = auth(async (req) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const org = await OrganizationService.getOrganization(req.auth.user.organizationId);
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }
    return NextResponse.json(org);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch organization" },
      { status: 500 }
    );
  }
});

export const PATCH = auth(async (req) => {
  if (!req.auth?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, openingCashBalance, openingBankBalance } = body;

    if (!name) {
      return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
    }

    const updateData: {
      name: string;
      openingCashBalance?: Prisma.Decimal;
      openingBankBalance?: Prisma.Decimal;
    } = { name };

    if (openingCashBalance !== undefined) {
      updateData.openingCashBalance = new Prisma.Decimal(openingCashBalance);
    }
    if (openingBankBalance !== undefined) {
      updateData.openingBankBalance = new Prisma.Decimal(openingBankBalance);
    }

    const org = await OrganizationService.updateOrganization(
      req.auth.user.organizationId,
      updateData
    );

    return NextResponse.json(org);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update organization" },
      { status: 500 }
    );
  }
});
