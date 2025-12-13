# Quick Update/Redeploy Guide

## Steps to Pull and Redeploy Updates

### 1. Navigate to Project Directory
```bash
cd ~/kind-minds-ai
```

### 2. Pull Latest Changes
```bash
git pull origin main
# Or your branch name: git pull origin master
```

### 3. Load Environment Variables (if needed)
```bash
# Export frontend env vars for docker-compose
export $(cat .env.local | grep -v '^#' | xargs)

# Export backend env vars
export $(cat backend/.env | grep -v '^#' | xargs)
```

### 4. Rebuild and Restart Services

**Option A: Rebuild Only Frontend (for frontend-only changes)**
```bash
cd deploy
docker-compose -f docker-compose.yml build --no-cache frontend
docker-compose -f docker-compose.yml up -d frontend
```

**Option B: Rebuild Everything (for major changes)**
```bash
cd deploy
docker-compose -f docker-compose.yml build --no-cache
docker-compose -f docker-compose.yml up -d
```

**Option C: Quick Restart (if no code/build changes, just config)**
```bash
cd deploy
docker-compose -f docker-compose.yml restart
```

### 5. Check Status
```bash
# Check all containers are running
docker-compose -f docker-compose.yml ps

# Check logs
docker-compose -f docker-compose.yml logs -f --tail=50
```

### 6. Verify Deployment
```bash
# Test frontend
curl -I https://kindminds.in

# Test backend
curl http://localhost:8000/

# Check specific service logs
docker-compose -f docker-compose.yml logs frontend | tail -20
docker-compose -f docker-compose.yml logs backend | tail -20
docker-compose -f docker-compose.yml logs nginx | tail -20
```

## Common Scenarios

### Frontend Code Changes (like removing Google auth)
```bash
cd ~/kind-minds-ai
git pull
cd deploy
docker-compose -f docker-compose.yml build --no-cache frontend
docker-compose -f docker-compose.yml up -d frontend
```

### Backend Code Changes
```bash
cd ~/kind-minds-ai
git pull
cd deploy
docker-compose -f docker-compose.yml build --no-cache backend
docker-compose -f docker-compose.yml up -d backend
```

### Environment Variable Changes
```bash
# 1. Update .env.local or backend/.env
nano ~/kind-minds-ai/.env.local
# or
nano ~/kind-minds-ai/backend/.env

# 2. Rebuild affected service
cd ~/kind-minds-ai/deploy
docker-compose -f docker-compose.yml build --no-cache frontend  # if frontend env changed
docker-compose -f docker-compose.yml build --no-cache backend    # if backend env changed

# 3. Restart
docker-compose -f docker-compose.yml up -d
```

### Nginx Config Changes
```bash
cd ~/kind-minds-ai
git pull
cd deploy
docker-compose -f docker-compose.yml restart nginx
# Or rebuild if nginx.conf changed significantly
docker-compose -f docker-compose.yml up -d --force-recreate nginx
```

## Troubleshooting

### If Build Fails
```bash
# Check for errors
docker-compose -f docker-compose.yml build --no-cache frontend 2>&1 | tee build.log

# Clean up and retry
docker-compose -f docker-compose.yml down
docker system prune -f
docker-compose -f docker-compose.yml build --no-cache
```

### If Container Won't Start
```bash
# Check logs
docker-compose -f docker-compose.yml logs frontend
docker-compose -f docker-compose.yml logs backend

# Check if ports are in use
sudo netstat -tulpn | grep -E ':(80|443|3000|8000)'

# Restart specific service
docker-compose -f docker-compose.yml restart frontend
```

### Rollback to Previous Version
```bash
cd ~/kind-minds-ai
git log --oneline  # Find previous commit hash
git checkout <previous-commit-hash>
cd deploy
docker-compose -f docker-compose.yml build --no-cache
docker-compose -f docker-compose.yml up -d
```

## One-Liner for Quick Updates
```bash
cd ~/kind-minds-ai && git pull && cd deploy && docker-compose -f docker-compose.yml build --no-cache frontend && docker-compose -f docker-compose.yml up -d frontend
```

