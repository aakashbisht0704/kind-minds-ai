# KindMinds AI

> **AI-Based Real-Time Mental Health, Stress and Trauma Assessment & Distress Prediction System for Victims of Atrocities**

KindMinds AI is an autonomous, trauma-informed crisis stabilization and triage system built for victims of conflict, war, and extreme trauma. Built entirely in **100% TypeScript** and powered by **Bun**, it executes real-time autonomic distress telemetry, somatic stabilization via autonomous tool calling, and non-retraumatizing safety planning.

The design system is directly inspired by the high-agency aesthetic of [Parley - AI Agent Framer Template for SaaS Startups](https://parley.framer.ai/).

---

## Live Deployments

| Service | Target Platform | Live URL |
| :--- | :--- | :--- |
| **Landing Page** | Cloudflare Pages (`kindminds-landing`) | [https://kindminds-landing.pages.dev](https://kindminds-landing.pages.dev) |
| **Dashboard & Auth Worker** | Cloudflare Worker + Assets (`kindminds-dashboard`) | [https://kindminds-dashboard.aakashbisht1204.workers.dev](https://kindminds-dashboard.aakashbisht1204.workers.dev) |
| **Edge Database** | Cloudflare D1 SQL (`kindminds-db`) | Provisioned with 10 tables |

---

## Core Architecture & Capabilities

- **100% TypeScript Monorepo:** Managed via Bun workspaces with zero legacy Python or external dependencies.
- **Autonomous Agentic Tool Pipeline:**
  - `assessDistress`: Analyzes physiological markers, panic signals, and hyperarousal indices.
  - `initiateGrounding`: Automatically dispatches 5-4-3-2-1 Sensory Grounding, 4-7-8 Breathing, or Bilateral Butterfly Hugs.
  - `triggerSafetyEscalation`: Escalates high-distress sessions to verified 24/7 global crisis lifelines.
  - `saveSafetyPlan`: Persists structured Stanley-Brown evidence-based safety steps.
- **Trauma-Informed Safe Access (BetterAuth):**
  - **1-Click Pseudonymous Intake:** Generates an isolated, cryptographically secure guest session. Zero personal identifiable information (PII) required.
  - **Clinician & Caseworker Mode:** Optional email/password credentials with salted hashing on Cloudflare D1.
- **Stealth & Privacy Guardrails:**
  - **Double-ESC Emergency Purge:** Instantly scrubs session cache, clears local storage, and replaces browser history with a benign search page.
  - **Privacy Text Blur:** Obscures sensitive clinical text in public or high-surveillance spaces.

---

## Monorepo Workspace Structure

```
kind-minds-ai/
├── apps/
│   ├── landing/              # Astro 5 SSR landing page with Parley design system (@astrojs/cloudflare)
│   └── dashboard/            # TanStack Start SSR dashboard & triage station (Cloudflare Workers)
├── packages/
│   ├── agent/                # Autonomous Trauma AI agent with Gemini 3.1 Pro & Groq failover
│   ├── db/                   # Kysely + Cloudflare D1 SQL schema and query builders
│   └── types/                # Domain models, clinical records, and session types
├── bun.lock                  # Bun lockfile
└── package.json              # Monorepo configuration
```

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) (v1.3+ recommended)
- [Cloudflare Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### Installation
```bash
# Install all dependencies across all packages
bun install
```

### Local Development
```bash
# Run Astro landing page locally
bun run dev:landing

# Run TanStack Start dashboard locally
bun run dev:dashboard
```

### Quality Assurance & Verification
```bash
# Run typecheck across all 5 workspace packages
bun run typecheck

# Run test suite across agent and BetterAuth suites
bun test
```

### Production Build & Cloudflare Deployment
```bash
# Build landing and dashboard
bun run build:landing
bun run build:dashboard

# Deploy Landing to Cloudflare Pages
cd apps/landing && bun x wrangler pages deploy dist --project-name kindminds-landing

# Deploy Dashboard to Cloudflare Workers
cd apps/dashboard && bun x wrangler deploy
```

---

## License

Licensed under the MIT License.
