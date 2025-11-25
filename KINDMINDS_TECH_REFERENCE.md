# KindMinds - Technical Reference Documentation

## Application Overview

**KindMinds** is an AI-powered web application that combines academic study assistance with mental wellness support for students. It provides specialized AI chat assistants (Academic and Mindfulness), interactive tools, and wellness activities in a single integrated platform.

**Core Concept:** Dual-purpose platform where students can get academic help AND manage stress/wellness, with AI assistants specialized for each domain.

---

## Technology Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI Library:** React 19.1.0
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion 12.23.22
- **3D Graphics:** Three.js, @react-three/fiber
- **UI Components:** Radix UI primitives
- **Math Rendering:** KaTeX (via react-markdown with rehype-katex, remark-math)
- **Charts/Visualization:** Recharts
- **State Management:** React Context API
- **Authentication:** @supabase/auth-helpers-nextjs

### Backend
- **Framework:** Python FastAPI
- **AI Provider:** Groq API
- **AI Model:** Llama 3.3 70B Versatile
- **API Configuration:**
  - Temperature: 0.7
  - Max tokens: 1024
  - Fast inference via Groq

### Database & Storage
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage buckets
- **Real-time:** Supabase Realtime subscriptions
- **Security:** Row Level Security (RLS) policies

### Key Libraries & Tools
- **Date Handling:** date-fns
- **Icons:** lucide-react, @tabler/icons-react
- **Notifications:** sonner
- **Markdown:** react-markdown, remark-gfm, remark-math, rehype-katex

---

## Architecture

### Frontend Structure
```
src/app/
├── (pagesLayout)/          # Main application pages
│   ├── academic/           # Academic chat page
│   ├── mindfulness/        # Mindfulness chat page
│   ├── tools/              # Tools page + individual tool pages
│   ├── activities/          # Activities tracking page
│   └── profile/             # User profile dashboard
├── components/              # Reusable components
│   ├── ChatDisplay.tsx      # Message display component
│   ├── ChatInputDock.tsx    # Input field component
│   ├── Sidebar.tsx          # Chat history sidebar
│   └── modals/              # Modal components
├── contexts/                # React Context providers
│   ├── AuthContext.tsx      # Authentication state
│   ├── ChatContext.tsx      # Chat state management
│   └── ActivityContext.tsx  # Activity state
└── lib/                     # Utility functions & API clients
    ├── supabase.ts          # Supabase client
    ├── supabaseChat.ts      # Chat database operations
    ├── api.ts               # Backend API client
    ├── profileAPI.ts        # Profile operations
    └── toolsAPI.ts           # Tools operations
```

### Backend Structure
```
backend/
├── main.py                  # FastAPI application
├── requirements.txt         # Python dependencies
└── .env                     # Environment variables (Groq API key)
```

### Database Schema (Supabase)
- **profiles** - User profiles (name, preferences, stats)
- **chats** - Chat conversations (separated by type: academic/mindfulness)
- **personality_results** - MBTI test results
- **thought_labels** - Thought labeling records
- **reframes** - Reframed thoughts
- **flashcards** - Flashcard sets
- **quizzes** - Quiz sets
- **quiz_attempts** - Quiz completion tracking
- **problems** - Scanned problem analyses
- **activities** - Scheduled activities
- **sentiment_logs** - Sentiment analysis history
- **newsletter_subscribers** - Email list

---

## Core Features

### 1. Dual AI Chat System
- **Academic Chat:** Specialized for study help, homework, time management
- **Mindfulness Chat:** Specialized for stress management, meditation, wellness
- **Separation:** Complete chat history separation by type
- **Personalization:** MBTI-based response adaptation
- **Math Support:** Full LaTeX/KaTeX rendering for equations

### 2. Academic Tools
- Quiz generation from documents
- Flashcard creation from documents
- Problem scanning (image/text analysis)
- Puzzle and problem-solving games

### 3. Wellness Activities
- Guided meditation (2/5/10 min sessions)
- 5-4-3-2-1 Grounding exercise
- Memory game
- Breathing exercises
- Activity scheduling and tracking

### 4. Personalization
- MBTI personality integration
- Thought labeling and reframing
- Mood tracking via sentiment analysis
- Profile customization

### 5. User Dashboard
- Profile management
- Statistics (chats, meditation minutes, streaks)
- Mood charts over time
- Activity completion tracking

---

## Key Technical Features

### Chat System
- **Real-time Updates:** Supabase Realtime subscriptions
- **State Management:** React Context for chat operations
- **Message Rendering:** Markdown with LaTeX math support
- **Optimistic Updates:** Instant UI updates before server confirmation
- **Auto-scroll:** Automatic scrolling to latest message

### AI Integration
- **Dual Prompts:** Separate system prompts for academic vs mindfulness
- **Domain Restrictions:** AI refuses off-topic questions
- **Sentiment Analysis:** Real-time mood detection from messages
- **Activity Suggestions:** AI suggests wellness activities based on sentiment
- **MBTI Personalization:** Response style adapted to personality type

### Data Flow
1. User sends message → Frontend (ChatInputDock)
2. Sentiment analysis → Backend API (/api/tools/sentiment)
3. Message + sentiment → Backend API (/api/chat)
4. AI response → Backend (Groq API)
5. Response → Frontend → Database (Supabase)
6. Real-time update → All connected clients

### Security
- **Authentication:** Supabase Auth (email/password, OAuth)
- **Authorization:** Row Level Security (RLS) on all tables
- **Data Isolation:** Users can only access their own data
- **API Security:** CORS configured, environment variables for secrets

---

## API Endpoints (Backend)

- `GET /` - Health check
- `POST /api/chat` - Chat with AI (academic or mindfulness)
- `POST /api/tools/reframe` - Reframe negative thoughts
- `POST /api/tools/flashcards` - Generate flashcards from content
- `POST /api/tools/quiz` - Generate quiz from content
- `POST /api/tools/scan-problem` - Analyze scanned problem
- `POST /api/tools/sentiment` - Analyze message sentiment

---

## Deployment & Environment

### Development
- **Frontend:** `npm run dev` (Next.js dev server on port 3000)
- **Backend:** `python main.py` (FastAPI on port 8000)
- **Database:** Supabase cloud instance

### Environment Variables
- **Frontend:** `.env.local` (Supabase URL, Supabase Anon Key)
- **Backend:** `.env` (GROQ_API_KEY)

### Build
- **Frontend:** `npm run build` (Next.js production build)
- **Backend:** Python virtual environment with dependencies

---

## Key Design Patterns

1. **Context API:** Global state for auth, chats, activities
2. **Optimistic Updates:** UI updates before server confirmation
3. **Real-time Subscriptions:** Supabase Realtime for live updates
4. **Component Composition:** Reusable UI components
5. **Type Safety:** Full TypeScript coverage
6. **Responsive Design:** Mobile-first approach with Tailwind breakpoints

---

## Notable Technical Decisions

1. **Separate Chat Histories:** Academic and mindfulness chats stored separately with `tab` field
2. **Real-time Sync:** Supabase Realtime ensures multi-device consistency
3. **Math Rendering:** KaTeX chosen for high-quality mathematical notation
4. **Groq API:** Selected for fast inference speeds (vs OpenAI)
5. **Supabase:** Chosen for integrated auth, database, storage, and real-time
6. **Next.js App Router:** Modern React Server Components architecture
7. **TypeScript:** Full type safety across frontend and API contracts

---

## Current Status

- **MVP:** Fully functional
- **Production Ready:** Yes
- **Scalability:** Built on scalable infrastructure (Supabase, Groq)
- **Security:** Enterprise-grade (RLS, secure auth)
- **Performance:** Optimized with Next.js, fast AI responses via Groq

---

## Quick Reference

**What is KindMinds?**
- AI-powered study + wellness platform for students

**Tech Stack:**
- Frontend: Next.js 15 + React 19 + TypeScript + Tailwind
- Backend: Python FastAPI + Groq API (Llama 3.3 70B)
- Database: Supabase (PostgreSQL)

**Key Differentiator:**
- Only platform combining specialized academic AI + wellness tools + MBTI personalization

**Target Users:**
- Students (all levels) seeking academic help and stress management

---

*This document serves as a technical reference for understanding the KindMinds application architecture, technology choices, and implementation details.*

