# Environment Files Deployment Guide

## Your Current Setup

You have environment files in two locations:
1. **`.env.local`** in the root folder (for Next.js frontend)
2. **`backend/.env`** in the backend folder (for FastAPI backend)

## How Docker Compose Handles This

The updated `docker-compose.yml` now uses `env_file` to automatically load your existing environment files:

- **Frontend** loads from `../.env.local` (root folder)
- **Backend** loads from `../backend/.env` (backend folder)

## Option 1: Use Your Existing Files (Recommended)

### Step 1: Update your `.env.local` (root folder)

Make sure it has these variables for production:

```bash
# Frontend variables (NEXT_PUBLIC_* are exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_BACKEND_URL=https://yourdomain.com/api
NEXT_PUBLIC_BACKEND_FALLBACK=http://localhost:8000
```

### Step 2: Update your `backend/.env` file

Make sure it has these variables:

```bash
# Backend variables
GROQ_API_KEY=your_groq_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_key_here  # Optional
SUPABASE_SERVICE_KEY=your_service_key_here      # Optional
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,http://localhost:3000
```

### Step 3: Deploy as normal

The docker-compose.yml will automatically use these files!

```bash
docker-compose -f deploy/docker-compose.yml up -d --build
```

## Option 2: Create Single Deploy .env File

If you prefer to keep deployment configs separate:

### Step 1: Create `deploy/.env` file

```bash
cd deploy
cp env.example .env
nano .env
```

### Step 2: Fill in all values

Copy values from both `.env.local` and `backend/.env` into `deploy/.env`

### Step 3: The docker-compose.yml will use deploy/.env

The `environment:` section in docker-compose.yml will override the `env_file` values if you set them in `deploy/.env`.

## Variable Mapping

### Frontend Variables (from `.env.local`)

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase key | `eyJhbGc...` |
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL | `https://yourdomain.com/api` |
| `NEXT_PUBLIC_BACKEND_FALLBACK` | Fallback backend | `http://localhost:8000` |

### Backend Variables (from `backend/.env`)

| Variable | Purpose | Required |
|----------|---------|----------|
| `GROQ_API_KEY` | Groq AI API key | ✅ Yes |
| `HUGGINGFACE_API_KEY` | Hugging Face API | ❌ Optional |
| `SUPABASE_SERVICE_KEY` | Supabase admin key | ❌ Optional |
| `CORS_ORIGINS` | Allowed origins | ✅ Yes |

## Important Notes

1. **`.env.local`** is loaded first, then `environment:` section can override
2. **`backend/.env`** is loaded first, then `environment:` section can override
3. Variables in `docker-compose.yml` `environment:` section take precedence
4. **Never commit** `.env.local` or `backend/.env` to git (they should be in `.gitignore`)

## Quick Check Before Deploying

```bash
# Check if your .env.local has the right variables
cat .env.local | grep NEXT_PUBLIC

# Check if your backend/.env has the right variables
cat backend/.env | grep GROQ
cat backend/.env | grep CORS
```

## Troubleshooting

### "Environment variable not found" error

Make sure:
1. `.env.local` exists in root folder
2. `backend/.env` exists in backend folder
3. Variables are spelled correctly (case-sensitive!)
4. No extra spaces around `=` sign

### Variables not loading

Check the file paths in docker-compose.yml:
- Frontend: `../.env.local` (relative to `deploy/` folder)
- Backend: `../backend/.env` (relative to `deploy/` folder)

### Want to override specific variables?

You can still use `deploy/.env` and set variables there. They will override the `env_file` values.

## Example File Structure

```
kindminds_website/
├── .env.local              ← Frontend env (used by docker-compose)
├── backend/
│   └── .env                ← Backend env (used by docker-compose)
└── deploy/
    ├── docker-compose.yml  ← References ../.env.local and ../backend/.env
    ├── .env                ← Optional: can override env_file values
    └── env.example         ← Template file
```

---

**Recommendation:** Use Option 1 (your existing files) - it's simpler and keeps your dev/prod configs consistent!

