export interface SessionUser {
  id: string;
  email: string;
  name: string;
  roleId: string;
  roleName: string;
  organizationId?: string;
  tokenVersion: number;
}

export type PermissionName =
  | "VIEW_DASHBOARD"
  | "VIEW_RECEIPTS"
  | "CREATE_RECEIPT"
  | "CANCEL_RECEIPT"
  | "VIEW_STUDENTS"
  | "MANAGE_STUDENTS"
  | "EDIT_STUDENT"
  | "MANAGE_FEES"
  | "MANAGE_EXPENSES"
  | "VIEW_REPORTS"
  | "EXPORT_REPORTS"
  | "MANAGE_ORG"
  | "MANAGE_USERS";

export interface AuthError {
  code: "UNAUTHENTICATED" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND";
  message: string;
}

export class AuthenticationError extends Error {
  constructor(message = "Not authenticated") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Not authorized to perform this action") {
    super(message);
    this.name = "ForbiddenError";
  }
}
