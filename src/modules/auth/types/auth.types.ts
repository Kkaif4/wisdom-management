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
  // Screens
  | "VIEW_DASHBOARD"
  | "VIEW_STUDENTS_SCREEN"
  | "VIEW_RECEIPTS_SCREEN"
  | "VIEW_FEES_SCREEN"
  | "VIEW_EXPENSES_SCREEN"
  | "VIEW_REPORTS_SCREEN"
  | "VIEW_SETTINGS_SCREEN"
  | "VIEW_USERS_SCREEN"

  // Students
  | "VIEW_STUDENT_LIST"
  | "VIEW_STUDENT_DETAILS"
  | "CREATE_STUDENT"
  | "EDIT_STUDENT"
  | "DELETE_STUDENT"
  | "IMPORT_STUDENTS"
  | "EXPORT_STUDENTS"

  // Receipts
  | "VIEW_RECEIPT_LIST"
  | "VIEW_RECEIPT_DETAILS"
  | "CREATE_RECEIPT"
  | "EDIT_RECEIPT"
  | "CANCEL_RECEIPT"
  | "PRINT_RECEIPT"
  | "EMAIL_RECEIPT"

  // Fees
  | "VIEW_FEE_STRUCTURE"
  | "CREATE_FEE_STRUCTURE"
  | "EDIT_FEE_STRUCTURE"
  | "DELETE_FEE_STRUCTURE"
  | "ASSIGN_FEES"
  | "WAIVE_FEES"
  | "APPLY_DISCOUNTS"

  // Expenses
  | "VIEW_EXPENSE_LIST"
  | "VIEW_EXPENSE_DETAILS"
  | "CREATE_EXPENSE"
  | "EDIT_EXPENSE"
  | "DELETE_EXPENSE"
  | "APPROVE_EXPENSE"

  // Reports
  | "VIEW_FINANCIAL_REPORTS"
  | "VIEW_STUDENT_REPORTS"
  | "VIEW_FEE_REPORTS"
  | "VIEW_EXPENSE_REPORTS"
  | "EXPORT_REPORTS"
  | "GENERATE_CUSTOM_REPORTS"

  // Organization
  | "VIEW_ORG_SETTINGS"
  | "EDIT_ORG_SETTINGS"
  | "MANAGE_ACADEMIC_SESSIONS"
  | "MANAGE_INCOME_CATEGORIES"
  | "MANAGE_EXPENSE_CATEGORIES"
  | "VIEW_AUDIT_LOGS"

  // Users
  | "VIEW_USER_LIST"
  | "CREATE_USER"
  | "EDIT_USER"
  | "DELETE_USER"
  | "ASSIGN_ROLES"
  | "RESET_USER_PASSWORD";

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
