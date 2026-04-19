import { SessionUser } from "../types/auth.types";
import { hasPermission, isOwner } from "./base.policy";

/**
 * Student Policy
 * Logic for VIEW_STUDENTS, MANAGE_STUDENTS, EDIT_STUDENT
 */
export class StudentPolicy {
  static async canViewStudents(user: SessionUser): Promise<boolean> {
    return await hasPermission(user, "VIEW_STUDENTS");
  }

  static async canManageStudents(user: SessionUser): Promise<boolean> {
    return await hasPermission(user, "MANAGE_STUDENTS");
  }

  static async canEditStudent(
    user: SessionUser,
    studentOrgId: string,
  ): Promise<boolean> {
    const hasPerm = await hasPermission(user, "EDIT_STUDENT");
    return hasPerm && isOwner(user, studentOrgId);
  }
}
