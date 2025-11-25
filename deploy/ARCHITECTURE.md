# KindMinds Deployment Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Internet Users                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   Nginx (Port 80/443) │
         │   Reverse Proxy       │
         │   SSL Termination     │
         │   Rate Limiting       │
         │   Static Caching     │
         └───────┬───────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐  ┌──────────────┐
│  Frontend    │  │  Backend    │
│  Next.js 15  │  │  FastAPI    │
│  Port 3000   │  │  Port 8000   │
│  (Internal)  │  │  (Internal) │
└──────┬───────┘  └──────┬───────┘
       │                 │
       │                 │
       └────────┬────────┘
                │
    ┌───────────┴────────────┐
    │                        │
    ▼                        ▼
┌──────────┐          ┌──────────┐
│ Supabase │          │ Groq API │
│ Database │          │ AI Model │
│ Auth     │          │          │
│ Storage  │          │          │
│ Realtime │          │          │
└──────────┘          └──────────┘
```

## Component Details

### 1. Nginx Reverse Proxy

**Purpose:**
- Single entry point for all traffic
- SSL/TLS termination
- Request routing (frontend vs backend)
- Static asset caching
- Rate limiting
- WebSocket proxying for Supabase Realtime

**Configuration:**
- HTTP (Port 80): Initial setup, Let's Encrypt challenges
- HTTPS (Port 443): Production traffic
- Routes `/api/*` → Backend
- Routes `/*` → Frontend
- WebSocket upgrade headers for real-time features

**Features:**
- Gzip compression
- Static asset caching (1 year)
- Rate limiting (API: 10 req/s, General: 30 req/s)
- Cloudflare IP ranges support
- Security headers (HSTS, X-Frame-Options, etc.)

### 2. Frontend (Next.js 15)

**Technology:**
- Next.js 15 with App Router
- React 19
- TypeScript
- Standalone output mode for Docker

**Features:**
- Server-Side Rendering (SSR)
- Static Site Generation (SSG)
- API Routes (if needed)
- Image optimization
- Automatic code splitting

**Docker Configuration:**
- Multi-stage build
- Node 20 Alpine base
- Non-root user (nextjs:nodejs)
- Standalone server mode
- Port 3000 (internal)

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public Supabase key
- `NEXT_PUBLIC_BACKEND_URL` - Backend API URL
- `NEXT_PUBLIC_BACKEND_FALLBACK` - Fallback backend URL

### 3. Backend (FastAPI)

**Technology:**
- Python 3.11
- FastAPI framework
- Uvicorn ASGI server
- Groq API integration

**Features:**
- RESTful API endpoints
- AI chat processing
- Document processing (quizzes, flashcards)
- Sentiment analysis
- CORS middleware
- Request validation (Pydantic)

**Docker Configuration:**
- Python 3.11 slim base
- Non-root user (appuser)
- 4 Uvicorn workers
- 300s timeout for long AI requests
- Port 8000 (internal)

**Environment Variables:**
- `GROQ_API_KEY` - Groq API key (required)
- `HUGGINGFACE_API_KEY` - Optional sentiment fallback
- `SUPABASE_SERVICE_KEY` - Optional admin operations
- `CORS_ORIGINS` - Allowed origins (comma-separated)

**API Endpoints:**
- `GET /` - Health check
- `POST /api/chat` - AI chat (academic/mindfulness)
- `POST /api/tools/reframe` - Thought reframing
- `POST /api/tools/flashcards` - Generate flashcards
- `POST /api/tools/quiz` - Generate quiz
- `POST /api/tools/scan-problem` - Analyze problem
- `POST /api/tools/sentiment` - Sentiment analysis

### 4. External Services

#### Supabase
- **Database:** PostgreSQL with RLS
- **Authentication:** Email/password, OAuth
- **Storage:** File uploads (avatars, documents)
- **Realtime:** WebSocket subscriptions for chat updates
- **Tables:** profiles, chats, flashcards, quizzes, etc.

#### Groq API
- **Model:** Llama 3.3 70B Versatile
- **Purpose:** AI chat responses
- **Rate Limits:** Check Groq console
- **Timeout:** 300s for long requests

## Data Flow

### Chat Request Flow

```
User → Nginx → Frontend (Next.js)
                ↓
            ChatInputDock
                ↓
            Sentiment Analysis → Backend /api/tools/sentiment
                ↓
            Chat Request → Backend /api/chat
                ↓
            Groq API (Llama 3.3 70B)
                ↓
            Response → Frontend
                ↓
            Save to Supabase (chats table)
                ↓
            Real-time update → All connected clients
```

### File Upload Flow

```
User → Frontend
        ↓
    Upload to Supabase Storage
        ↓
    Process file → Backend /api/tools/flashcards or /api/tools/quiz
        ↓
    Groq API processes content
        ↓
    Return flashcards/quiz
        ↓
    Save to Supabase (flashcards/quizzes table)
```

## Network Architecture

### Internal Network (Docker)

- **Network:** `kindminds-network` (bridge)
- **Services communicate via service names:**
  - `frontend:3000`
  - `backend:8000`
  - `nginx` (exposed ports 80/443)

### External Access

- **Port 80:** HTTP (redirects to HTTPS after SSL setup)
- **Port 443:** HTTPS (production traffic)
- **Firewall:** UFW allows only 22, 80, 443

## Security Considerations

### 1. Container Security
- All containers run as non-root users
- Minimal base images (Alpine, slim)
- No unnecessary packages
- Read-only file systems where possible

### 2. Network Security
- Firewall (UFW) configured
- Only necessary ports exposed
- Internal service communication via Docker network
- CORS properly configured

### 3. Application Security
- Environment variables for secrets
- Supabase RLS policies
- Rate limiting in Nginx
- Security headers in Nginx and Next.js
- SSL/TLS encryption

### 4. Data Security
- Supabase handles database encryption
- Service keys never exposed to frontend
- API keys stored in environment variables
- No sensitive data in code or logs

## Performance Optimizations

### Frontend
- Next.js standalone mode (smaller image)
- Static asset caching (1 year)
- Image optimization
- Code splitting
- Gzip compression

### Backend
- Multiple Uvicorn workers (4)
- Connection pooling
- Async/await for I/O operations
- Request timeout configuration

### Nginx
- Gzip compression
- Static asset caching
- Keep-alive connections
- Worker process optimization
- Rate limiting

## Scalability

### Current Setup
- Single server deployment
- Suitable for: 100-1000 concurrent users
- Can handle: ~100 requests/second

### Future Scaling Options

**Vertical Scaling:**
- Increase VPS resources (RAM, CPU)
- Increase backend workers
- Add more Nginx workers

**Horizontal Scaling:**
- Multiple VPS instances
- Load balancer (HAProxy, Cloudflare)
- Docker Swarm or Kubernetes
- Database read replicas

## Monitoring & Logging

### Logs
- **Frontend:** Docker logs
- **Backend:** Docker logs
- **Nginx:** Access and error logs
- **Location:** Docker volumes (`nginx-logs`)

### Health Checks
- All services have health check endpoints
- Docker health checks configured
- Nginx health endpoint: `/health`

### Monitoring (Future)
- Prometheus + Grafana
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Uptime monitoring

## Backup Strategy

### Code
- Git repository (primary backup)
- Tagged releases

### Database
- Supabase automatic backups
- Manual exports via Supabase dashboard

### Configuration
- Environment variables in secure storage
- Docker Compose files in git
- SSL certificates auto-renewed

## Disaster Recovery

### Recovery Steps
1. Restore code from git
2. Restore environment variables
3. Rebuild Docker images
4. Restore database from Supabase backup
5. Verify SSL certificates
6. Test all endpoints

### RTO (Recovery Time Objective)
- **Target:** < 1 hour
- **Components:** Code (5 min), Config (5 min), Database (10 min), Testing (30 min)

## Cost Optimization

### Current Costs
- VPS: Hostinger pricing
- Supabase: Free tier or paid
- Groq API: Pay per request
- Domain: Annual fee

### Optimization Tips
- Use Supabase free tier if possible
- Monitor Groq API usage
- Optimize Docker image sizes
- Cache static assets aggressively
- Use CDN for static assets (future)

---

**Last Updated:** [Date]  
**Version:** 1.0  
**Status:** Production Ready

