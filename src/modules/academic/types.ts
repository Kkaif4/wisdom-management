import { SessionStatus } from "@/prisma/generated";

// ──────────────────────────────────────────────────────────────────────
// Class
// ──────────────────────────────────────────────────────────────────────

export interface CreateClassInput {
  name: string;
  displayOrder: number;
  organizationId: string;
}

export interface UpdateClassInput {
  name?: string;
  displayOrder?: number;
  isActive?: boolean;
}

// ──────────────────────────────────────────────────────────────────────
// Division
// ──────────────────────────────────────────────────────────────────────

export interface CreateDivisionInput {
  name: string;
  classId: string;
  capacity?: number;
  organizationId: string;
}

export interface UpdateDivisionInput {
  name?: string;
  capacity?: number;
}

// ──────────────────────────────────────────────────────────────────────
// Academic Session
// ──────────────────────────────────────────────────────────────────────

export interface CreateSessionInput {
  name: string;
  startDate: Date;
  endDate: Date;
  organizationId: string;
}

export interface UpdateSessionInput {
  name?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface SessionFilter {
  organizationId: string;
  status?: SessionStatus;
}
