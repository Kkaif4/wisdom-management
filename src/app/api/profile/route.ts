import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PasswordUtils } from "@/modules/auth/utils/password.utils";
import { AuditService } from "@/modules/auth/services/audit.service";
import { SessionUser } from "@/modules/auth/types/auth.types";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, password, currentPassword } = body;

    // Fetch current user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};
    const auditMeta: any = { oldValue: {}, newValue: {} };

    // Handle Name Update
    if (name !== undefined && name !== user.name) {
      if (!name.trim()) {
        return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      }
      updateData.name = name;
      auditMeta.oldValue.name = user.name;
      auditMeta.newValue.name = name;
    }

    // Handle Email Update
    if (email !== undefined && email !== user.email) {
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json({ error: "Email address is already in use" }, { status: 400 });
      }

      updateData.email = email;
      auditMeta.oldValue.email = user.email;
      auditMeta.newValue.email = email;
    }

    // Handle Password Update
    if (password) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to set a new password" }, { status: 400 });
      }

      const isCurrentPasswordCorrect = await PasswordUtils.comparePassword(
        currentPassword,
        user.passwordHash
      );
      if (!isCurrentPasswordCorrect) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      const strengthCheck = PasswordUtils.validateStrength(password);
      if (!strengthCheck.isValid) {
        return NextResponse.json({ error: strengthCheck.message }, { status: 400 });
      }

      const newPasswordHash = await PasswordUtils.hashPassword(password);
      updateData.passwordHash = newPasswordHash;
      auditMeta.newValue.passwordChanged = true;
    }

    // If no changes, return early
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No changes to update" });
    }

    // Perform Update
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // Log the data audit event
    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      roleName: user.role.name,
      organizationId: user.organizationId ?? undefined,
      tokenVersion: user.tokenVersion,
    };

    await AuditService.logDataEvent(
      "ROLE_UPDATED" as any, // Cast since action expects DataEvent enum values
      sessionUser,
      "USER",
      user.id,
      {
        oldValue: auditMeta.oldValue,
        newValue: auditMeta.newValue,
        reason: "User updated their own profile",
      }
    );

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error: any) {
    console.error("[PROFILE_PATCH]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
