import { SessionUser } from "../types/auth.types";
import { hasPermission, isOwner } from "./base.policy";

/**
 * Receipt Policy
 * Logic for VIEW_RECEIPTS, CREATE_RECEIPT, CANCEL_RECEIPT
 */
export class ReceiptPolicy {
  static async canViewReceipts(user: SessionUser): Promise<boolean> {
    return await hasPermission(user, "VIEW_RECEIPTS");
  }

  static async canCreateReceipt(
    user: SessionUser,
    studentOrgId: string,
  ): Promise<boolean> {
    const hasPerm = await hasPermission(user, "CREATE_RECEIPT");
    return hasPerm && isOwner(user, studentOrgId);
  }

  static async canCancelReceipt(
    user: SessionUser,
    receiptOrgId: string,
  ): Promise<boolean> {
    const hasPerm = await hasPermission(user, "CANCEL_RECEIPT");
    return hasPerm && isOwner(user, receiptOrgId);
  }
}
