# Deployment Guide

## Vercel Deployment (Recommended)

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- PostgreSQL database (Neon, Vercel Postgres, or other)

### Steps

1. **Connect Repository**
   - Go to Vercel dashboard
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   Set these in Vercel dashboard under Settings > Environment Variables:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   NODE_ENV=production
   ```

3. **Deploy**
   - Vercel will automatically deploy on push to main branch
   - Database migrations run automatically via build script

### Database Setup

**Option 1: Vercel Postgres**
```bash
# Install Vercel CLI
npm i -g vercel

# Create database
vercel storage create postgres

# Get connection string from Vercel dashboard
```

**Option 2: Neon**
```bash
# Create account at neon.tech
# Create new project
# Copy connection string to DATABASE_URL
```

**Option 3: Other PostgreSQL**
- Ensure database is publicly accessible
- Update DATABASE_URL with connection details

### Post-Deployment

1. **Run Migrations**
   ```bash
   # Migrations run automatically during build
   # Or manually via Vercel CLI:
   vercel env pull .env.local
   npm run db:deploy
   ```

2. **Verify Deployment**
   - Visit your Vercel domain
   - Test file upload functionality
   - Check database connections

## Manual Deployment

### Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t syllabus-app .
   docker run -p 3000:3000 -e DATABASE_URL="..." syllabus-app
   ```

### VPS Deployment

1. **Server Setup**
   ```bash
   # Install Node.js 20+
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   npm install -g pm2
   ```

2. **Application Setup**
   ```bash
   git clone <your-repo>
   cd syllabus
   npm ci
   npm run build
   
   # Set environment variables
   echo "DATABASE_URL=..." > .env.production
   
   # Start with PM2
   pm2 start npm --name "syllabus" -- start
   pm2 startup
   pm2 save
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Environment Configuration

### Required Variables
```bash
DATABASE_URL=postgresql://...  # PostgreSQL connection string
NODE_ENV=production           # Environment mode
```

### Optional Variables
```bash
GOOGLE_CLIENT_ID=...          # Google Calendar integration
GOOGLE_CLIENT_SECRET=...      # Google Calendar integration
BLOB_READ_WRITE_TOKEN=...     # Vercel Blob storage
OPENAI_API_KEY=...           # Enhanced parsing with OpenAI
```

## Database Migrations

### Initial Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### Schema Changes
```bash
# Create new migration
npx prisma migrate dev --name descriptive-name

# Deploy to production
npx prisma migrate deploy
```

## Monitoring & Maintenance

### Health Checks
- Implement `/api/health` endpoint
- Monitor database connectivity
- Check file upload functionality

### Logging
- Use structured logging
- Monitor error rates
- Track performance metrics

### Backups
- Regular database backups
- File storage backups
- Configuration backups

### Updates
```bash
# Update dependencies
npm update

# Test locally
npm run test
npm run build

# Deploy via git push or manual deployment
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check DATABASE_URL format
   - Verify database is accessible
   - Check connection limits

2. **Build Failures**
   - Check Node.js version (requires 18+)
   - Verify all dependencies are installed
   - Check TypeScript errors

3. **File Upload Issues**
   - Check file size limits
   - Verify MIME type handling
   - Check storage configuration

4. **Performance Issues**
   - Monitor database query performance
   - Check memory usage
   - Optimize large file handling

### Debug Commands
```bash
# Check build locally
npm run build

# Run type checking
npm run type-check

# Test database connection
npx prisma db pull

# View logs (Vercel)
vercel logs

# View logs (PM2)
pm2 logs syllabus
```
