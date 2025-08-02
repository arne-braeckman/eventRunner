# Coding Standards

## Critical Fullstack Rules

- **Type Safety:** Always use TypeScript interfaces for all data structures, never use `any` type
- **API Consistency:** All API endpoints must be defined through tRPC routers with proper input validation
- **Database Access:** Never query database directly from components, always use tRPC procedures
- **Authentication:** Check user permissions in all protected tRPC procedures using middleware
- **Error Handling:** All tRPC procedures must use proper error codes (UNAUTHORIZED, FORBIDDEN, etc.)
- **Real-time Updates:** Use Convex real-time subscriptions for collaborative features, not polling
- **File Uploads:** Always validate file types and sizes, use Cloudinary for processing
- **Environment Variables:** Access env vars only through validated config objects, never process.env directly

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `ContactCard.tsx` |
| Hooks | camelCase with 'use' | `useContacts.ts` |
| tRPC Procedures | camelCase | `contact.getById` |
| Database Tables | snake_case | `contact_interactions` |
| API Routes | kebab-case | `/api/trpc/contact.getById` |
| Environment Variables | SCREAMING_SNAKE_CASE | `DATABASE_URL` |
