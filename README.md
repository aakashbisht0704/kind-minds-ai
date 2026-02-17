# KindMinds AI

KindMinds is a conversational AI web application designed for supportive, reflective interaction rather than pure question‑answering.

Instead of acting like a search engine, the system focuses on structured dialogue — helping users articulate thoughts, reflect, and explore ideas through guided conversation.

The project explores how interface design + conversation constraints can shape healthier human‑AI interaction.

---

## What it does

* chat‑based interaction with memory
* structured conversational flow (not unrestricted prompting)
* state‑aware responses
* message synchronization across sessions
* controlled AI behavior (see restrictions)

This is not intended to replace professional help — the system is designed to be assistive, not authoritative.

---

## Tech Stack

**Frontend**

* Next.js (App Router)
* TypeScript
* Tailwind
* shadcn/ui

**Backend**

* Node API routes
* Python AI processing layer

**Data**

* Supabase (auth + database + realtime)
* Postgres

**Infrastructure**

* Docker support
* environment‑based config

---

## Architecture Overview

```
client (Next.js)
      ↓
api routes
      ↓
conversation manager
      ↓
AI response layer (python)
      ↓
database (supabase)
```

The application separates:

* UI interaction
* conversation state logic
* AI generation
* persistence

This allows experimenting with different response models without rewriting the interface.

---

## Local Setup

### 1. Clone

```
git clone https://github.com/aakashbisht0704/kind-minds-ai.git
cd kind-minds-ai
```

### 2. Environment

Create `.env.local` using the sample:

```
cp env.sample .env.local
```

Fill required Supabase and AI keys.

---

### 3. Install dependencies

```
npm install
```

---

### 4. Run

```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Docker (optional)

```
docker build -t kindminds .
docker run -p 3000:3000 kindminds
```

---

## Project Structure

```
src/                → frontend + routes
backend/            → AI handling
supabase/           → database migrations
deploy/             → deployment config
public/             → static assets
```

---

## Design Goals

This project experiments with:

* safer conversational AI patterns
* bounded responses instead of open‑ended generation
* persistent conversational context
* UI‑driven behavior control

The focus is understanding interaction design around AI — not just model output quality.

---

## Status

Active experiment — behavior, prompts, and constraints change frequently.

---

## Notes

See:

* `AI_RESTRICTIONS.md`
* `CHAT_FEATURES.md`
* `KINDMINDS_CONTEXT.md`
