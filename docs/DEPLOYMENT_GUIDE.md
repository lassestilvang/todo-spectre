# Todo Spectre - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Configuration](#configuration)
4. [Database Setup](#database-setup)
5. [Build Process](#build-process)
6. [Deployment Options](#deployment-options)
7. [Post-Deployment](#post-deployment)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- Node.js v20+
- Bun v1.3.3+
- SQLite (or other supported database)
- Git
- Vercel CLI (for Vercel deployments)

### Required Accounts
- Vercel account (for production deployment)
- GitHub account (for CI/CD)
- Sentry account (for error tracking)

## Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/todo-spectre.git
cd todo-spectre
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Set Up Environment Variables
Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Edit `.env` with your specific configuration:

```env
# Database Configuration
DATABASE_URL="file:./prod.db"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# Security
JWT_SECRET="your-jwt-secret"
SESSION_SECRET="your-session-secret"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
```

## Configuration

### Production Configuration
The application uses a multi-environment configuration system. For production:

1. **Next.js Configuration**: `next.config.ts` - Main Next.js configuration
2. **Production Config**: `config/production.config.ts` - Production-specific settings
3. **Deployment Config**: `deploy.config.js` - Deployment target configurations

### Key Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `output` | Build output mode | `standalone` |
| `compress` | Enable compression | `true` |
| `poweredByHeader` | Hide Next.js header | `false` |
| `cache.staticFiles.maxAge` | Static file caching | `31536000` (1 year) |
| `images.unoptimized` | Image optimization | `false` |

## Database Setup

### SQLite Setup
```bash
# Initialize database
bun run db:migrate-full

# Seed with test data (optional)
bun run db:seed-test
```

### Database Configuration
The application uses Prisma ORM with SQLite by default. For production:

1. **Database URL**: Configure in `.env` as `DATABASE_URL`
2. **Migrations**: Run `bun run db:migrate-full` to apply all migrations
3. **Seeding**: Use `bun run db:seed-test` for initial data

## Build Process

### Production Build
```bash
# Clean build
bun run build:prod

# Or step-by-step
bun run db:migrate-full  # Apply migrations
bun run build           # Build Next.js app
```

### Build Optimization
The build process includes:
- Tree shaking
- Code splitting
- Asset optimization
- CSS minification
- JavaScript compression

## Deployment Options

### Vercel Deployment (Recommended)
```bash
# Install Vercel CLI
bun add -g vercel

# Deploy to production
bun run deploy:vercel:prod

# Deploy to preview
bun run deploy:vercel:preview
```

### Netlify Deployment
```bash
# Install Netlify CLI
bun add -g netlify-cli

# Deploy to production
bun run deploy:netlify:prod
```

### Manual Deployment
1. Build the application: `bun run build:prod`
2. Copy the `.next` directory to your server
3. Set up environment variables
4. Start the server: `node .next/standalone/server.js`

## Post-Deployment

### Health Checks
```bash
# Check database health
bun run db:health

# Run smoke tests
curl -I https://your-domain.com/api/health
```

### Cache Warming
```bash
# Warm up API caches
curl https://your-domain.com/api/tasks
curl https://your-domain.com/api/lists
```

## Monitoring and Maintenance

### Monitoring Setup
1. **Sentry**: Configure in `deploy.config.js`
2. **Logging**: Production logs go to `./logs/app.log`
3. **Performance**: Monitor via Vercel analytics

### Maintenance Tasks
```bash
# Database backup
sqlite3 prod.db .dump > backup-$(date +%Y-%m-%d).sql

# Database optimization
sqlite3 prod.db "VACUUM;"
sqlite3 prod.db "ANALYZE;"
```

## Troubleshooting

### Common Issues

**Database Connection Errors**
- Check `DATABASE_URL` in `.env`
- Verify database file permissions
- Run `bun run db:health` to test connection

**Build Failures**
- Clean build: `rm -rf .next && bun run build`
- Check Node.js/Bun versions
- Verify all dependencies: `bun install`

**Deployment Issues**
- Check environment variables
- Verify CI/CD secrets
- Review deployment logs

### Debugging
```bash
# Enable debug mode
NEXT_PUBLIC_FEATURE_DEBUG_MODE=true bun run dev

# Check logs
tail -f logs/app.log
```

## CI/CD Pipeline

The application includes a comprehensive GitHub Actions workflow:

1. **Test Job**: Runs linting and tests
2. **Build Job**: Creates production build
3. **Deploy Job**: Deploys to Vercel

Secrets required:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `JWT_SECRET`
- `SESSION_SECRET`

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Secrets**: Use GitHub Secrets for sensitive data
3. **Database**: Use proper file permissions for SQLite
4. **Authentication**: Rotate secrets regularly
5. **Updates**: Keep dependencies updated

## Performance Optimization

1. **Caching**: Configure CDN caching headers
2. **Images**: Optimize and compress images
3. **Database**: Add proper indexes
4. **API**: Implement rate limiting
5. **Bundle**: Analyze and optimize bundle size

## Rollback Procedure

1. Revert to previous Git commit
2. Rebuild and redeploy
3. Monitor for issues
4. Communicate with users if needed