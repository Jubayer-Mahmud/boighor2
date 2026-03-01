POST http://localhost:5000/api/admin/register
Body:
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123"
}# Production Deployment Guide

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] JWT_SECRET strong and unique
- [ ] Error handling comprehensive
- [ ] Rate limiting implemented
- [ ] Monitoring/logging setup

## Deployment Platforms

### Option 1: Heroku

#### Prerequisites
- Heroku account
- Heroku CLI installed

#### Steps

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create Heroku app**
   ```bash
   heroku create boighor-api
   ```

3. **Set environment variables**
   ```bash
   heroku config:set MONGODB_URI=mongodb+srv://...
   heroku config:set JWT_SECRET=your-strong-secret
   heroku config:set NODE_ENV=production
   heroku config:set CORS_ORIGIN=https://your-domain.com
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Verify**
   ```bash
   heroku logs --tail
   ```

### Option 2: Railway

#### Steps

1. **Connect GitHub repository**
   - Go to railway.app
   - Connect your GitHub account
   - Select repository

2. **Add MongoDB plugin**
   - In Railway dashboard
   - Add plugin → MongoDB

3. **Set environment variables**
   - PORT=5000
   - JWT_SECRET=...
   - CORS_ORIGIN=your-domain

4. **Deploy**
   - Automatic deployment on push to main

### Option 3: Render

#### Steps

1. **Create new service**
   - Connect GitHub
   - Select backend repository

2. **Configure**
   - Build command: `npm install`
   - Start command: `node server.js`
   - Environment: Node

3. **Add environment variables**
   - MONGODB_URI
   - JWT_SECRET
   - PORT=10000 (Render uses this)
   - CORS_ORIGIN

4. **Deploy**
   - Automatic on push

### Option 4: DigitalOcean App Platform

#### Steps

1. **Push to GitHub**
2. **Create app**
   - Spec: Node runtime
   - Build: `npm install`
   - Run: `node server.js`

3. **Configure environment**
4. **Deploy**

### Option 5: Self-Hosted (VPS)

#### Prerequisites
- VPS (Linode, DigitalOcean, AWS)
- SSH access
- Node.js installed
- MongoDB running

#### Steps

1. **SSH into server**
   ```bash
   ssh root@your-vps-ip
   ```

2. **Install dependencies**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo apt-get install -y npm
   ```

3. **Install PM2 (process manager)**
   ```bash
   sudo npm install -g pm2
   ```

4. **Clone repository**
   ```bash
   cd /home
   git clone https://github.com/your-repo/boighor.git
   cd boighor/backend
   ```

5. **Install backend dependencies**
   ```bash
   npm install
   ```

6. **Create .env file**
   ```bash
   nano .env
   ```
   Add production variables

7. **Start with PM2**
   ```bash
   pm2 start server.js --name "boighor-api"
   pm2 startup
   pm2 save
   ```

8. **Setup Nginx reverse proxy**
   ```bash
   sudo apt install nginx
   ```

   Create `/etc/nginx/sites-available/boighor`:
   ```nginx
   server {
     listen 80;
     server_name api.yourdomain.com;

     location / {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/boighor /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

## Database Setup

### MongoDB Atlas (Recommended for Cloud)

1. Create cluster
2. Create database user
3. Whitelist IP (or use 0.0.0.0/0 for testing)
4. Get connection string
5. Set MONGODB_URI environment variable

### Self-Hosted MongoDB

```bash
# Install
sudo apt-get install -y mongodb-org

# Start service
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database user
mongosh
> use admin
> db.createUser({
  user: "boighor",
  pwd: "strong-password",
  roles: ["dbOwner"]
})
> use boighor
> exit
```

Connection string:
```
mongodb://boighor:password@localhost:27017/boighor
```

## Environment Variables (Production)

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/boighor

# Server
PORT=5000
NODE_ENV=production

# Security
JWT_SECRET=generate-long-random-string-here
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=https://www.yourdomain.com

# Optional: Logging
LOG_LEVEL=info
```

### Generate strong JWT_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Performance Optimization

### 1. Enable compression
```javascript
import compression from 'compression';
app.use(compression());
```

### 2. Implement caching
```javascript
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300');
  next();
});
```

### 3. Database indexing
```javascript
// Already set up in models
schema.index({ email: 1 });
schema.index({ category: 1 });
```

### 4. Rate limiting
```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

### 5. Use CDN for images
- Upload product images to S3 or CDN
- Store URLs in database
- Update `image` field with CDN URL

## Monitoring & Logging

### PM2 Monitoring
```bash
pm2 web          # Web monitoring on port 9615
pm2 monit        # Terminal monitoring
```

### Application Logging
```bash
npm install winston
```

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Use in code
logger.info('Message');
logger.error('Error message');
```

## Monitoring Services

1. **New Relic** - Application monitoring
2. **DataDog** - Infrastructure monitoring
3. **Sentry** - Error tracking
4. **UptimeRobot** - Uptime monitoring

## SSL/HTTPS

### With Let's Encrypt (Free)
```bash
sudo certbot --nginx -d yourdomain.com
```

### Auto-renewal
```bash
sudo certbot renew --dry-run
```

## Database Backups

### MongoDB Atlas
- Automatic backups enabled by default
- Retention: 7 days (free tier)

### Manual backup
```bash
# Backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/boighor"

# Restore
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/boighor" ./dump
```

## Domain & DNS

1. Register domain (GoDaddy, Namecheap, etc.)
2. Update DNS records:
   ```
   A    api    1.2.3.4       (Your server IP)
   CNAME www   api.domain.com
   ```
3. Wait for propagation (24-48 hours)

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: boighor-api
          heroku_email: your-email@example.com
```

## Rollback Procedure

### Using PM2
```bash
pm2 reload boighor-api
```

### Using Heroku
```bash
heroku rollback
```

### Using Git
```bash
git revert <commit-hash>
git push origin main
```

## Post-Deployment Checklist

- [ ] API health check passing
- [ ] All endpoints tested
- [ ] Database performing well
- [ ] Monitoring alerts configured
- [ ] Logging working
- [ ] Backups running
- [ ] Team notified
- [ ] Documentation updated

## Troubleshooting Production Issues

### High Response Time
1. Check database performance
2. Check server resources
3. Review application logs
4. Optimize database queries

### Memory Leaks
```bash
pm2 monitor boighor-api
pm2 logs boighor-api
```

### Database Connection Issues
- Check MongoDB URI
- Check IP whitelist
- Check network connectivity
- Verify credentials

### CORS Errors in Production
- Update CORS_ORIGIN to production domain
- Restart server
- Clear browser cache

## Support & Monitoring

- Monitor logs regularly
- Set up error tracking (Sentry)
- Monitor uptime (UptimeRobot)
- Check API response times
- Track database usage

---

For detailed setup instructions, see SETUP.md
For API documentation, see README.md
