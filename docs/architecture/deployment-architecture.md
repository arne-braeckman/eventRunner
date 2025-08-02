# Deployment Architecture

## Deployment Strategy

**Frontend & Backend Deployment:**
- **Platform:** Vercel (primary deployment platform)
- **Build Command:** `pnpm build`
- **Output Directory:** `.next` (handled automatically by Vercel)
- **Edge Functions:** API routes automatically deployed as serverless functions

**Database Deployment:**
- **Platform:** Supabase (managed PostgreSQL)
- **Migration Strategy:** Prisma migrations via GitHub Actions
- **Backup Strategy:** Automated daily backups via Supabase

## CI/CD Pipeline

```yaml