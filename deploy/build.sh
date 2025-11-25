#!/bin/bash

# Load environment variables from .env.local
set -a
source ../.env.local
set +a

# Export variables for docker-compose
export NEXT_PUBLIC_SUPABASE_URL
export NEXT_PUBLIC_SUPABASE_ANON_KEY
export NEXT_PUBLIC_BACKEND_URL
export NEXT_PUBLIC_BACKEND_FALLBACK

# Load backend env vars too
set -a
source ../backend/.env
set +a

export GROQ_API_KEY
export CORS_ORIGINS

# Run docker-compose with all env vars
docker-compose -f docker-compose.yml "$@"

