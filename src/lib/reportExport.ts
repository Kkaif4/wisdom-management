/**
 * @deprecated The `exportToExcel` function has been removed.
 * All exports now use the centralized `ExcelService` from `@/modules/document/services/excel.service`.
 *
 * Migration guide:
 * - Replace: import { exportToExcel } from '@/lib/reportExport'
 * - With:    import { ExcelService } from '@/modules/document/services/excel.service'
 */

/**
 * Currency formatter utility. Still used across report pages for display.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
