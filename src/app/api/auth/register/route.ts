import { NextRequest } from "next/server";
import { OrganizationService } from "@/modules/organizations/organization.service";
import { Prisma } from "@/prisma/generated";
import { successResponse } from "@/lib/api-response";
import { ValidationError } from "@/lib/api-errors";
import { prisma } from "@/lib/prisma";
import { PasswordUtils } from "@/modules/auth/utils/password.utils";
import { ErrorUtils } from "@/modules/auth/utils/error.utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orgName, name, email, password, openingCash, openingBank } = body;

    // 1. Validations
    if (!orgName || !name || !email || !password) {
      throw new ValidationError("Missing required fields");
    }

    // Password Strength Check
    const strength = PasswordUtils.validateStrength(password);
    if (!strength.isValid) {
      throw new ValidationError(strength.message!);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ValidationError("User with this email already exists");
    }

    // 2. Organization & User Creation
    const passwordHash = await PasswordUtils.hashPassword(password);

    const result = await OrganizationService.setupOrganization({
      orgName,
      adminName: name,
      adminEmail: email,
      passwordHash,
      openingCash: new Prisma.Decimal(openingCash || 0),
      openingBank: new Prisma.Decimal(openingBank || 0),
    });

    return successResponse(
      {
        organization: {
          id: result.organization.id,
          name: result.organization.name,
        },
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
      },
      "Organization created successfully",
      201,
    );
  } catch (error: any) {
    // Standardized API error response
    return ErrorUtils.handleApiError(error);
  }
}
