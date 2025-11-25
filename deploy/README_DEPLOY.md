# KindMinds Production Deployment Guide

Complete production deployment guide for KindMinds on Hostinger VPS using Docker, Docker Compose, and Nginx.

## Architecture Overview

```
Internet
   ↓
Nginx (Port 80/443) - Reverse Proxy
   ├──→ Frontend (Next.js) - Port 3000
   └──→ Backend (FastAPI) - Port 8000
   ↓
Supabase (External) - Database, Auth, Storage, Realtime
Groq API (External) - AI Model
```

### Components

1. **Frontend (Next.js 15)**
   - Standalone mode for Docker
   - Runs on port 3000 internally
   - Served via Nginx reverse proxy

2. **Backend (FastAPI)**
   - Python 3.11 with Uvicorn
   - 4 workers for concurrency
   - Runs on port 8000 internally
   - Handles AI requests (Groq API)

3. **Nginx**
   - Reverse proxy for frontend and backend
   - SSL/TLS termination
   - Static asset caching
   - WebSocket support for Supabase Realtime
   - Rate limiting
   - Gzip compression

## Prerequisites

### Hostinger VPS Requirements

- **OS:** Ubuntu 22.04 LTS or 20.04 LTS
- **RAM:** Minimum 2GB (4GB recommended)
- **CPU:** 2+ cores
- **Storage:** 20GB+ free space
- **Domain:** Pointed to VPS IP address

### Software to Install

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y

# Install firewall (UFW)
sudo apt install ufw -y
```

## Step-by-Step Deployment

### Step 1: Prepare Server

```bash
# SSH into your Hostinger VPS
ssh root@your-vps-ip

# Create deployment user (optional but recommended)
sudo adduser kindminds
sudo usermod -aG docker kindminds
sudo usermod -aG sudo kindminds
su - kindminds

# Create project directory
mkdir -p ~/kindminds
cd ~/kindminds
```

### Step 2: Clone Repository

```bash
# Clone your repository
git clone https://github.com/yourusername/kindminds_website.git .
# OR upload files via SCP/SFTP

# Navigate to deploy directory
cd deploy
```

### Step 3: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit environment variables
nano .env
```

Fill in all required values:
- `NEXT_PUBLIC_SUPABASE_URL` - From Supabase dashboard
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase dashboard
- `NEXT_PUBLIC_BACKEND_URL` - Your domain with `/api` (e.g., `https://kindminds.com/api`)
- `GROQ_API_KEY` - From Groq console
- `CORS_ORIGINS` - Your domain(s)

### Step 4: Update Backend CORS

Edit `backend/main.py` to update CORS origins:

```python
# Replace the CORS middleware section
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "https://yourdomain.com").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Step 5: Update Nginx Configuration

Edit `deploy/nginx.conf`:

1. Replace `yourdomain.com` with your actual domain
2. Uncomment HTTPS server block after SSL setup

### Step 6: Build and Start Services

```bash
# Navigate to project root (one level up from deploy/)
cd ..

# Build and start all services
docker-compose -f deploy/docker-compose.yml up -d --build

# Check logs
docker-compose -f deploy/docker-compose.yml logs -f

# Check service status
docker-compose -f deploy/docker-compose.yml ps
```

### Step 7: Configure Firewall

```bash
# Allow SSH (important - do this first!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Step 8: Setup SSL with Let's Encrypt

```bash
# Stop Nginx temporarily (if running)
docker-compose -f deploy/docker-compose.yml stop nginx

# Run Certbot
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates will be saved to:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem

# Copy certificates to deploy/ssl directory
mkdir -p deploy/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem deploy/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem deploy/ssl/
sudo chown $USER:$USER deploy/ssl/*.pem
```

### Step 9: Update Nginx for HTTPS

1. Edit `deploy/nginx.conf`
2. Uncomment the HTTPS server block
3. Update SSL certificate paths if needed
4. Uncomment HTTP to HTTPS redirect

```bash
# Restart Nginx
docker-compose -f deploy/docker-compose.yml restart nginx
```

### Step 10: Setup Auto-Renewal for SSL

```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab for auto-renewal
sudo crontab -e

# Add this line (runs twice daily)
0 0,12 * * * certbot renew --quiet --deploy-hook "cd /home/kindminds/kindminds/deploy && docker-compose restart nginx"
```

## Verification

### Check Services

```bash
# All services should be running
docker-compose -f deploy/docker-compose.yml ps

# Check logs
docker-compose -f deploy/docker-compose.yml logs frontend
docker-compose -f deploy/docker-compose.yml logs backend
docker-compose -f deploy/docker-compose.yml logs nginx
```

### Test Endpoints

```bash
# Health check
curl http://yourdomain.com/health

# Backend API
curl http://yourdomain.com/api/

# Frontend
curl http://yourdomain.com/
```

### Browser Testing

1. Visit `https://yourdomain.com`
2. Test login/authentication
3. Test chat functionality
4. Test file uploads
5. Check browser console for errors

## Maintenance Commands

### View Logs

```bash
# All services
docker-compose -f deploy/docker-compose.yml logs -f

# Specific service
docker-compose -f deploy/docker-compose.yml logs -f frontend
docker-compose -f deploy/docker-compose.yml logs -f backend
docker-compose -f deploy/docker-compose.yml logs -f nginx
```

### Restart Services

```bash
# Restart all
docker-compose -f deploy/docker-compose.yml restart

# Restart specific service
docker-compose -f deploy/docker-compose.yml restart frontend
docker-compose -f deploy/docker-compose.yml restart backend
docker-compose -f deploy/docker-compose.yml restart nginx
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose -f deploy/docker-compose.yml up -d --build

# Or rebuild specific service
docker-compose -f deploy/docker-compose.yml up -d --build frontend
```

### Stop Services

```bash
# Stop all
docker-compose -f deploy/docker-compose.yml down

# Stop and remove volumes (careful - deletes data!)
docker-compose -f deploy/docker-compose.yml down -v
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose -f deploy/docker-compose.yml logs service-name

# Check if port is in use
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Check Docker resources
docker stats
```

### Frontend Build Fails

```bash
# Check Node version
docker run --rm node:20-alpine node --version

# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose -f deploy/docker-compose.yml build --no-cache frontend
```

### Backend Connection Issues

```bash
# Test backend directly
docker exec -it kindminds-backend curl http://localhost:8000/

# Check environment variables
docker exec -it kindminds-backend env | grep GROQ

# Check CORS configuration
docker exec -it kindminds-backend cat backend/main.py | grep CORS
```

### Nginx Issues

```bash
# Test Nginx configuration
docker exec -it kindminds-nginx nginx -t

# Check Nginx logs
docker-compose -f deploy/docker-compose.yml logs nginx

# Reload Nginx config
docker exec -it kindminds-nginx nginx -s reload
```

### SSL Certificate Issues

```bash
# Check certificate expiration
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check certificate files
ls -la deploy/ssl/
```

### Database Connection Issues

- Verify Supabase URL and keys in `.env`
- Check Supabase project is active
- Verify network connectivity from VPS to Supabase
- Check Supabase dashboard for connection logs

### AI API Issues

```bash
# Test Groq API key
docker exec -it kindminds-backend python -c "import os; from groq import Groq; print('Key valid' if os.getenv('GROQ_API_KEY') else 'Key missing')"

# Check API rate limits in Groq console
```

## Performance Optimization

### Increase Backend Workers

Edit `deploy/Dockerfile.backend`:
```dockerfile
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "8", ...]
```

### Enable Nginx Caching

Already configured in `nginx.conf` for static assets.

### Monitor Resources

```bash
# Install monitoring tools
sudo apt install htop iotop -y

# Monitor Docker containers
docker stats

# Check disk usage
df -h
docker system df
```

## Security Checklist

- [ ] Firewall configured (UFW)
- [ ] SSL certificates installed and auto-renewing
- [ ] Environment variables secured (`.env` not in git)
- [ ] Non-root user for deployment
- [ ] Docker containers running as non-root
- [ ] Rate limiting enabled in Nginx
- [ ] CORS properly configured
- [ ] Supabase RLS policies enabled
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`
- [ ] SSH key authentication (disable password auth)

## Backup Strategy

### Database (Supabase)
- Supabase handles backups automatically
- Export data periodically via Supabase dashboard

### Application Code
- Git repository is your backup
- Tag releases: `git tag v1.0.0`

### Environment Variables
- Store `.env` securely (password manager, encrypted storage)
- Never commit to git

## Scaling Considerations

### Horizontal Scaling
- Use Docker Swarm or Kubernetes for multiple servers
- Load balancer in front of multiple Nginx instances

### Vertical Scaling
- Upgrade VPS resources (RAM, CPU)
- Increase backend workers
- Add Redis for session management (future)

## Support & Resources

- **Docker Docs:** https://docs.docker.com/
- **Nginx Docs:** https://nginx.org/en/docs/
- **Let's Encrypt:** https://letsencrypt.org/docs/
- **Supabase Docs:** https://supabase.com/docs
- **Groq Docs:** https://console.groq.com/docs

## Quick Reference

```bash
# Start services
docker-compose -f deploy/docker-compose.yml up -d

# Stop services
docker-compose -f deploy/docker-compose.yml down

# View logs
docker-compose -f deploy/docker-compose.yml logs -f

# Rebuild after code changes
docker-compose -f deploy/docker-compose.yml up -d --build

# Check status
docker-compose -f deploy/docker-compose.yml ps

# Execute command in container
docker exec -it kindminds-frontend sh
docker exec -it kindminds-backend bash
docker exec -it kindminds-nginx sh
```

---

**Deployment Date:** [Fill in after deployment]  
**Domain:** [Your domain]  
**VPS Provider:** Hostinger  
**Status:** Production Ready ✅

