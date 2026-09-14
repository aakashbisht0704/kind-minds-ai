-- Cloudflare D1 Schema for KindMinds Trauma Assessment & Distress Prediction System
-- Includes BetterAuth Core Tables & Trauma Triage Infrastructure

-- 1. BetterAuth Core Tables
CREATE TABLE IF NOT EXISTS "user" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" INTEGER NOT NULL DEFAULT 0,
  "image" TEXT,
  "createdAt" DATE NOT NULL,
  "updatedAt" DATE NOT NULL,
  "isAnonymous" INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "expiresAt" DATE NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "createdAt" DATE NOT NULL,
  "updatedAt" DATE NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" ("userId");

CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" DATE,
  "refreshTokenExpiresAt" DATE,
  "scope" TEXT,
  "password" TEXT,
  "createdAt" DATE NOT NULL,
  "updatedAt" DATE NOT NULL
);

CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" ("userId");

CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" DATE NOT NULL,
  "createdAt" DATE NOT NULL,
  "updatedAt" DATE NOT NULL
);

CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" ("identifier");

-- 2. Trauma Triage Tables
CREATE TABLE IF NOT EXISTS triage_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  survivor_pseudonym TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('active', 'stabilized', 'escalated', 'closed')),
  initial_score REAL NOT NULL DEFAULT 5.0,
  current_score REAL NOT NULL DEFAULT 5.0,
  primary_trauma_category TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON triage_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON triage_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_updated ON triage_sessions(updated_at DESC);

CREATE TABLE IF NOT EXISTS triage_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES triage_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  telemetry_json TEXT,
  tool_calls_json TEXT,
  timestamp TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_session ON triage_messages(session_id, timestamp ASC);

CREATE TABLE IF NOT EXISTS distress_telemetry (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES triage_sessions(id) ON DELETE CASCADE,
  timestamp TEXT NOT NULL,
  score REAL NOT NULL,
  primary_state TEXT NOT NULL,
  trajectory TEXT NOT NULL,
  confidence REAL NOT NULL,
  clinical_markers_json TEXT NOT NULL DEFAULT '[]',
  trigger_flags_json TEXT NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_telemetry_session ON distress_telemetry(session_id, timestamp ASC);

CREATE TABLE IF NOT EXISTS safety_plans (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE REFERENCES triage_sessions(id) ON DELETE CASCADE,
  warning_signs_json TEXT NOT NULL DEFAULT '[]',
  internal_coping_json TEXT NOT NULL DEFAULT '[]',
  social_distractions_json TEXT NOT NULL DEFAULT '[]',
  trusted_contacts_json TEXT NOT NULL DEFAULT '[]',
  professional_contacts_json TEXT NOT NULL DEFAULT '[]',
  safe_environment_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clinical_assessments (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES triage_sessions(id) ON DELETE CASCADE,
  screener_type TEXT NOT NULL,
  answers_json TEXT NOT NULL,
  total_score REAL NOT NULL,
  subscale_scores_json TEXT,
  severity_category TEXT NOT NULL,
  interpretation TEXT NOT NULL,
  timestamp TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assessments_session ON clinical_assessments(session_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS verified_resources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  country_code TEXT NOT NULL,
  region TEXT NOT NULL,
  hotline TEXT,
  sms_text TEXT,
  website TEXT NOT NULL,
  specialty TEXT NOT NULL,
  languages_json TEXT NOT NULL,
  free_and_confidential INTEGER NOT NULL DEFAULT 1,
  secure_chat_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_resources_country ON verified_resources(country_code);
CREATE INDEX IF NOT EXISTS idx_resources_specialty ON verified_resources(specialty);
