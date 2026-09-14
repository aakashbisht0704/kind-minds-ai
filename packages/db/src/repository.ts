import type {
  TriageSession,
  TriageMessage,
  DistressTelemetry,
  SafetyPlan,
  ClinicalAssessmentRecord,
  SupportResource,
} from "@kindminds/types";
import { DEFAULT_VERIFIED_RESOURCES } from "./seed";

// Interface matching Cloudflare D1 database interface
export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike;
  batch<T = unknown>(statements: D1PreparedStatementLike[]): Promise<D1ResponseLike<T>[]>;
}

export interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  first<T = unknown>(colName?: string): Promise<T | null>;
  all<T = unknown>(): Promise<D1ResultLike<T>>;
  run(): Promise<D1ResponseLike>;
}

export interface D1ResultLike<T = unknown> {
  results?: T[];
  success: boolean;
  error?: string;
}

export interface D1ResponseLike<T = unknown> {
  success: boolean;
  error?: string;
  results?: T[];
}

export class TriageRepository {
  private d1: D1DatabaseLike | null;
  // In-memory fallback for local dev / testing if D1 binding is not present
  private memorySessions = new Map<string, TriageSession>();
  private memoryMessages = new Map<string, TriageMessage[]>();
  private memoryTelemetry = new Map<string, DistressTelemetry[]>();
  private memorySafetyPlans = new Map<string, SafetyPlan>();
  private memoryAssessments = new Map<string, ClinicalAssessmentRecord[]>();

  constructor(d1?: D1DatabaseLike | null) {
    this.d1 = d1 ?? null;
  }

  async createSession(params: {
    id?: string;
    pseudonym: string;
    initialScore?: number;
    traumaCategory?: string;
  }): Promise<TriageSession> {
    const id = params.id ?? `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const session: TriageSession = {
      id,
      survivorPseudonym: params.pseudonym,
      status: "active",
      initialScore: params.initialScore ?? 5.0,
      currentScore: params.initialScore ?? 5.0,
      primaryTraumaCategory: params.traumaCategory as any,
      createdAt: now,
      updatedAt: now,
    };

    if (this.d1) {
      await this.d1
        .prepare(
          `INSERT INTO triage_sessions (id, survivor_pseudonym, status, initial_score, current_score, primary_trauma_category, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          session.id,
          session.survivorPseudonym,
          session.status,
          session.initialScore,
          session.currentScore,
          session.primaryTraumaCategory ?? null,
          session.createdAt,
          session.updatedAt
        )
        .run();
    } else {
      this.memorySessions.set(id, session);
      this.memoryMessages.set(id, []);
      this.memoryTelemetry.set(id, []);
    }

    return session;
  }

  async getSession(id: string): Promise<TriageSession | null> {
    if (this.d1) {
      const row = await this.d1
        .prepare(`SELECT * FROM triage_sessions WHERE id = ?`)
        .bind(id)
        .first<any>();
      if (!row) return null;
      return {
        id: row.id,
        survivorPseudonym: row.survivor_pseudonym,
        status: row.status,
        initialScore: row.initial_score,
        currentScore: row.current_score,
        primaryTraumaCategory: row.primary_trauma_category,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    }
    return this.memorySessions.get(id) ?? null;
  }

  async updateSessionScore(
    id: string,
    score: number,
    status?: "active" | "stabilized" | "escalated" | "closed"
  ): Promise<void> {
    const now = new Date().toISOString();
    if (this.d1) {
      if (status) {
        await this.d1
          .prepare(`UPDATE triage_sessions SET current_score = ?, status = ?, updated_at = ? WHERE id = ?`)
          .bind(score, status, now, id)
          .run();
      } else {
        await this.d1
          .prepare(`UPDATE triage_sessions SET current_score = ?, updated_at = ? WHERE id = ?`)
          .bind(score, now, id)
          .run();
      }
    } else {
      const existing = this.memorySessions.get(id);
      if (existing) {
        existing.currentScore = score;
        if (status) existing.status = status;
        existing.updatedAt = now;
      }
    }
  }

  async saveMessage(msg: TriageMessage): Promise<void> {
    if (this.d1) {
      await this.d1
        .prepare(
          `INSERT INTO triage_messages (id, session_id, role, content, telemetry_json, tool_calls_json, timestamp)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          msg.id,
          msg.sessionId,
          msg.role,
          msg.content,
          msg.telemetry ? JSON.stringify(msg.telemetry) : null,
          msg.toolCalls ? JSON.stringify(msg.toolCalls) : null,
          msg.timestamp
        )
        .run();
    } else {
      const list = this.memoryMessages.get(msg.sessionId) ?? [];
      list.push(msg);
      this.memoryMessages.set(msg.sessionId, list);
    }
  }

  async getSessionMessages(sessionId: string): Promise<TriageMessage[]> {
    if (this.d1) {
      const res = await this.d1
        .prepare(`SELECT * FROM triage_messages WHERE session_id = ? ORDER BY timestamp ASC`)
        .bind(sessionId)
        .all<any>();
      return (res.results ?? []).map((row) => ({
        id: row.id,
        sessionId: row.session_id,
        role: row.role,
        content: row.content,
        timestamp: row.timestamp,
        telemetry: row.telemetry_json ? JSON.parse(row.telemetry_json) : undefined,
        toolCalls: row.tool_calls_json ? JSON.parse(row.tool_calls_json) : undefined,
      }));
    }
    return this.memoryMessages.get(sessionId) ?? [];
  }

  async saveTelemetry(telemetry: DistressTelemetry): Promise<void> {
    if (this.d1) {
      await this.d1
        .prepare(
          `INSERT INTO distress_telemetry (id, session_id, timestamp, score, primary_state, trajectory, confidence, clinical_markers_json, trigger_flags_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          telemetry.id,
          telemetry.sessionId,
          telemetry.timestamp,
          telemetry.score,
          telemetry.primaryState,
          telemetry.trajectory,
          telemetry.confidence,
          JSON.stringify(telemetry.clinicalMarkers),
          JSON.stringify(telemetry.triggerFlags)
        )
        .run();
    } else {
      const list = this.memoryTelemetry.get(telemetry.sessionId) ?? [];
      list.push(telemetry);
      this.memoryTelemetry.set(telemetry.sessionId, list);
    }
  }

  async getSessionTelemetry(sessionId: string): Promise<DistressTelemetry[]> {
    if (this.d1) {
      const res = await this.d1
        .prepare(`SELECT * FROM distress_telemetry WHERE session_id = ? ORDER BY timestamp ASC`)
        .bind(sessionId)
        .all<any>();
      return (res.results ?? []).map((row) => ({
        id: row.id,
        sessionId: row.session_id,
        timestamp: row.timestamp,
        score: row.score,
        primaryState: row.primary_state,
        trajectory: row.trajectory,
        confidence: row.confidence,
        clinicalMarkers: JSON.parse(row.clinical_markers_json || "[]"),
        triggerFlags: JSON.parse(row.trigger_flags_json || "[]"),
      }));
    }
    return this.memoryTelemetry.get(sessionId) ?? [];
  }

  async getSafetyPlan(sessionId: string): Promise<SafetyPlan | null> {
    if (this.d1) {
      const row = await this.d1
        .prepare(`SELECT * FROM safety_plans WHERE session_id = ?`)
        .bind(sessionId)
        .first<any>();
      if (!row) return null;
      return {
        id: row.id,
        sessionId: row.session_id,
        warningSigns: JSON.parse(row.warning_signs_json || "[]"),
        internalCopingStrategies: JSON.parse(row.internal_coping_json || "[]"),
        socialDistractions: JSON.parse(row.social_distractions_json || "[]"),
        trustedContacts: JSON.parse(row.trusted_contacts_json || "[]"),
        professionalContacts: JSON.parse(row.professional_contacts_json || "[]"),
        safeEnvironmentSteps: JSON.parse(row.safe_environment_json || "[]"),
        updatedAt: row.updated_at,
      };
    }
    return this.memorySafetyPlans.get(sessionId) ?? null;
  }

  async upsertSafetyPlan(plan: SafetyPlan): Promise<void> {
    if (this.d1) {
      await this.d1
        .prepare(
          `INSERT INTO safety_plans (id, session_id, warning_signs_json, internal_coping_json, social_distractions_json, trusted_contacts_json, professional_contacts_json, safe_environment_json, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(session_id) DO UPDATE SET
             warning_signs_json = excluded.warning_signs_json,
             internal_coping_json = excluded.internal_coping_json,
             social_distractions_json = excluded.social_distractions_json,
             trusted_contacts_json = excluded.trusted_contacts_json,
             professional_contacts_json = excluded.professional_contacts_json,
             safe_environment_json = excluded.safe_environment_json,
             updated_at = excluded.updated_at`
        )
        .bind(
          plan.id,
          plan.sessionId,
          JSON.stringify(plan.warningSigns),
          JSON.stringify(plan.internalCopingStrategies),
          JSON.stringify(plan.socialDistractions),
          JSON.stringify(plan.trustedContacts),
          JSON.stringify(plan.professionalContacts),
          JSON.stringify(plan.safeEnvironmentSteps),
          plan.updatedAt
        )
        .run();
    } else {
      this.memorySafetyPlans.set(plan.sessionId, plan);
    }
  }

  async saveClinicalAssessment(record: ClinicalAssessmentRecord): Promise<void> {
    if (this.d1) {
      await this.d1
        .prepare(
          `INSERT INTO clinical_assessments (id, session_id, screener_type, answers_json, total_score, subscale_scores_json, severity_category, interpretation, timestamp)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          record.id,
          record.sessionId,
          record.screenerType,
          JSON.stringify(record.answers),
          record.totalScore,
          record.subscaleScores ? JSON.stringify(record.subscaleScores) : null,
          record.severityCategory,
          record.interpretation,
          record.timestamp
        )
        .run();
    } else {
      const list = this.memoryAssessments.get(record.sessionId) ?? [];
      list.push(record);
      this.memoryAssessments.set(record.sessionId, list);
    }
  }

  async getClinicalAssessments(sessionId: string): Promise<ClinicalAssessmentRecord[]> {
    if (this.d1) {
      const res = await this.d1
        .prepare(`SELECT * FROM clinical_assessments WHERE session_id = ? ORDER BY timestamp DESC`)
        .bind(sessionId)
        .all<any>();
      return (res.results ?? []).map((row) => ({
        id: row.id,
        sessionId: row.session_id,
        screenerType: row.screener_type,
        answers: JSON.parse(row.answers_json || "{}"),
        totalScore: row.total_score,
        subscaleScores: row.subscale_scores_json ? JSON.parse(row.subscale_scores_json) : undefined,
        severityCategory: row.severity_category,
        interpretation: row.interpretation,
        timestamp: row.timestamp,
      }));
    }
    return this.memoryAssessments.get(sessionId) ?? [];
  }

  async getResources(countryCode?: string, specialty?: string): Promise<SupportResource[]> {
    if (this.d1) {
      let query = `SELECT * FROM verified_resources WHERE 1=1`;
      const binds: any[] = [];
      if (countryCode && countryCode !== "GLOBAL") {
        query += ` AND (country_code = ? OR country_code = 'GLOBAL')`;
        binds.push(countryCode);
      }
      if (specialty && specialty !== "all") {
        query += ` AND specialty = ?`;
        binds.push(specialty);
      }
      const res = await this.d1.prepare(query).bind(...binds).all<any>();
      if (res.results && res.results.length > 0) {
        return res.results.map((row) => ({
          id: row.id,
          name: row.name,
          description: row.description,
          countryCode: row.country_code,
          region: row.region,
          hotline: row.hotline || undefined,
          smsText: row.sms_text || undefined,
          website: row.website,
          specialty: row.specialty,
          languages: JSON.parse(row.languages_json || "[]"),
          freeAndConfidential: Boolean(row.free_and_confidential),
          secureChatUrl: row.secure_chat_url || undefined,
        }));
      }
    }
    // Fallback to default verified resources
    return DEFAULT_VERIFIED_RESOURCES.filter((r) => {
      const matchCountry = !countryCode || countryCode === "GLOBAL" || r.countryCode === countryCode || r.countryCode === "GLOBAL";
      const matchSpecialty = !specialty || specialty === "all" || r.specialty === specialty;
      return matchCountry && matchSpecialty;
    });
  }
}
