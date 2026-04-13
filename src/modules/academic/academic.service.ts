import { SessionStatus } from "@/prisma/generated";
import {
  ClassRepository,
  DivisionRepository,
  SessionRepository,
} from "./academic.repository";
import type {
  CreateClassInput,
  UpdateClassInput,
  CreateDivisionInput,
  UpdateDivisionInput,
  CreateSessionInput,
  UpdateSessionInput,
  SessionFilter,
} from "./types";

// ──────────────────────────────────────────────────────────────────────
// Class Service
// ──────────────────────────────────────────────────────────────────────

export class ClassService {
  static async createClass(input: CreateClassInput) {
    return ClassRepository.create(input);
  }

  static async getClasses(organizationId: string) {
    return ClassRepository.findByOrg(organizationId);
  }

  static async getClassById(id: string, organizationId: string) {
    const cls = await ClassRepository.findById(id, organizationId);
    if (!cls) throw new Error("Class not found");
    return cls;
  }

  static async updateClass(
    id: string,
    organizationId: string,
    data: UpdateClassInput,
  ) {
    await this.getClassById(id, organizationId);
    return ClassRepository.update(id, organizationId, data);
  }

  static async deleteClass(id: string, organizationId: string) {
    const hasEnrollments = await ClassRepository.hasEnrollments(id);
    if (hasEnrollments) {
      throw new Error("Cannot delete class with existing enrollments");
    }
    return ClassRepository.delete(id, organizationId);
  }
}

// ──────────────────────────────────────────────────────────────────────
// Division Service
// ──────────────────────────────────────────────────────────────────────

export class DivisionService {
  static async createDivision(input: CreateDivisionInput) {
    // Validate class exists and belongs to the same org
    await ClassService.getClassById(input.classId, input.organizationId);
    return DivisionRepository.create(input);
  }

  static async getDivisionsByClass(classId: string, organizationId: string) {
    return DivisionRepository.findByClass(classId, organizationId);
  }

  static async getDivisionById(id: string, organizationId: string) {
    const div = await DivisionRepository.findById(id, organizationId);
    if (!div) throw new Error("Division not found");
    return div;
  }

  static async updateDivision(
    id: string,
    organizationId: string,
    data: UpdateDivisionInput,
  ) {
    await this.getDivisionById(id, organizationId);
    return DivisionRepository.update(id, organizationId, data);
  }

  static async deleteDivision(id: string, organizationId: string) {
    const hasEnrollments = await DivisionRepository.hasEnrollments(id);
    if (hasEnrollments) {
      throw new Error("Cannot delete division with existing enrollments");
    }
    return DivisionRepository.delete(id, organizationId);
  }
}

// ──────────────────────────────────────────────────────────────────────
// Academic Session Service
// ──────────────────────────────────────────────────────────────────────

export class SessionService {
  static async createSession(input: CreateSessionInput) {
    if (input.endDate <= input.startDate) {
      throw new Error("End date must be after start date");
    }
    return SessionRepository.create(input);
  }

  static async getSessions(filter: SessionFilter) {
    return SessionRepository.findByOrg(filter);
  }

  static async getSessionById(id: string, organizationId: string) {
    const session = await SessionRepository.findById(id, organizationId);
    if (!session) throw new Error("Academic session not found");
    return session;
  }

  static async getActiveSession(organizationId: string) {
    return SessionRepository.findActive(organizationId);
  }

  static async updateSession(
    id: string,
    organizationId: string,
    data: UpdateSessionInput,
  ) {
    const session = await this.getSessionById(id, organizationId);
    if (
      session.status === SessionStatus.CLOSED ||
      session.status === SessionStatus.ARCHIVED
    ) {
      throw new Error("Cannot modify a closed or archived session");
    }
    return SessionRepository.update(id, organizationId, data);
  }

  /**
   * Activates a session. Only ONE session can be ACTIVE at a time per org.
   * Any currently active session is automatically closed.
   */
  static async activateSession(id: string, organizationId: string) {
    const session = await this.getSessionById(id, organizationId);
    if (session.status !== SessionStatus.UPCOMING) {
      throw new Error("Only UPCOMING sessions can be activated");
    }

    // Auto-close the currently active session (if any)
    const currentActive = await SessionRepository.findActive(organizationId);
    if (currentActive) {
      await SessionRepository.updateStatus(
        currentActive.id,
        organizationId,
        SessionStatus.CLOSED,
      );
    }

    return SessionRepository.updateStatus(
      id,
      organizationId,
      SessionStatus.ACTIVE,
    );
  }

  /**
   * Closes a session. Locks financial records (read-only).
   */
  static async closeSession(id: string, organizationId: string) {
    const session = await this.getSessionById(id, organizationId);
    if (session.status !== SessionStatus.ACTIVE) {
      throw new Error("Only ACTIVE sessions can be closed");
    }
    return SessionRepository.updateStatus(
      id,
      organizationId,
      SessionStatus.CLOSED,
    );
  }
}
