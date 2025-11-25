# SSL Certificate Setup for kindminds.in

## Quick SSL Setup Guide

### Prerequisites
- Domain `kindminds.in` DNS pointing to your VPS IP
- Services running (frontend, backend, nginx)
- Port 80 accessible from internet

### Step 1: Install Certbot

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### Step 2: Stop Nginx Temporarily

```bash
cd ~/kind-minds-ai/deploy
docker-compose -f docker-compose.yml stop nginx
```

### Step 3: Get SSL Certificate

```bash
# Get certificate for kindminds.in and www.kindminds.in
sudo certbot certonly --standalone -d kindminds.in -d www.kindminds.in
```

**What happens:**
- Certbot will ask for your email (for renewal notices)
- Agree to terms of service
- Choose whether to share email with EFF (optional)
- Certbot will verify domain ownership
- Certificates will be saved to `/etc/letsencrypt/live/kindminds.in/`

### Step 4: Copy Certificates to Deploy Folder

```bash
# Create SSL directory
mkdir -p ~/kind-minds-ai/deploy/ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/kindminds.in/fullchain.pem ~/kind-minds-ai/deploy/ssl/
sudo cp /etc/letsencrypt/live/kindminds.in/privkey.pem ~/kind-minds-ai/deploy/ssl/

# Fix permissions
sudo chown $USER:$USER ~/kind-minds-ai/deploy/ssl/*.pem
sudo chmod 644 ~/kind-minds-ai/deploy/ssl/*.pem
```

### Step 5: Enable HTTPS in Nginx

```bash
cd ~/kind-minds-ai/deploy
nano nginx.conf
```

**Find these sections and uncomment them:**

1. **HTTP to HTTPS redirect** (around line 80):
   - Find: `# server {` with `#     server_name kindminds.in`
   - Remove all `#` from that entire server block

2. **HTTPS server block** (around line 100):
   - Find: `#     listen 443 ssl http2;`
   - Remove all `#` from that entire server block

**Save:** `Ctrl + X`, then `Y`, then `Enter`

### Step 6: Restart Nginx

```bash
docker-compose -f docker-compose.yml up -d nginx
```

### Step 7: Test HTTPS

Visit: `https://kindminds.in`

You should see a padlock icon in your browser!

### Step 8: Setup Auto-Renewal

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Add to crontab for auto-renewal
sudo crontab -e
```

**Add this line at the end:**
```
0 0,12 * * * certbot renew --quiet --deploy-hook "cd /root/kind-minds-ai/deploy && docker-compose -f docker-compose.yml restart nginx"
```

**Save:** `Ctrl + X`, then `Y`, then `Enter`

## Troubleshooting

### Certificate not issued

**Check DNS:**
```bash
dig kindminds.in
# Should show your VPS IP address
```

**Check port 80 is open:**
```bash
sudo ufw status
# Should show 80/tcp ALLOW
```

**Check nothing is using port 80:**
```bash
sudo netstat -tulpn | grep :80
```

### Certificate files not found

```bash
# Check if certificates exist
sudo ls -la /etc/letsencrypt/live/kindminds.in/

# If they don't exist, re-run certbot
sudo certbot certonly --standalone -d kindminds.in -d www.kindminds.in
```

### Nginx SSL errors

```bash
# Check Nginx logs
docker-compose -f docker-compose.yml logs nginx

# Test Nginx config
docker exec -it kindminds-nginx nginx -t

# Check certificate paths in nginx.conf
# Should be: /etc/nginx/ssl/fullchain.pem and /etc/nginx/ssl/privkey.pem
```

### Renewal not working

```bash
# Test renewal manually
sudo certbot renew --dry-run

# Check crontab
sudo crontab -l

# Check certificate expiration
sudo certbot certificates
```

## Certificate Expiration

Certificates expire every 90 days. The auto-renewal cron job should handle this automatically.

**Check expiration:**
```bash
sudo certbot certificates
```

**Renew manually if needed:**
```bash
sudo certbot renew
cd ~/kind-minds-ai/deploy
docker-compose -f docker-compose.yml restart nginx
```

## Security Notes

- Certificates are stored in `/etc/letsencrypt/` (Let's Encrypt standard location)
- Private keys are copied to `deploy/ssl/` for Docker volume mounting
- Certificates auto-renew every 60 days (before 90-day expiration)
- HTTPS is enforced (HTTP redirects to HTTPS)

---

**Domain:** kindminds.in  
**Status:** Ready for SSL setup ✅

