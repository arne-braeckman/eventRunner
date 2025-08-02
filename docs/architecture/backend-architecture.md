# Backend Architecture

## Service Architecture (tRPC-based)

Since the T3 Stack uses a monolithic approach with tRPC, the "backend" is integrated into the Next.js application through API routes and server-side functions.

### tRPC Router Organization
```
src/server/
  api/
    routers/
      contact.ts        # Contact management procedures
      opportunity.ts    # CRM pipeline procedures
      project.ts        # Project management procedures
      document.ts       # Document handling procedures
      payment.ts        # Payment processing procedures
      analytics.ts      # Reporting procedures
      user.ts          # User management procedures
    root.ts            # Main router combining all sub-routers
    trpc.ts           # tRPC configuration and context
  auth.ts             # Convex Auth configuration
  convex.ts          # Convex client instance
```

### Server-side Function Template
```typescript
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const contactRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      leadSource: z.enum(['WEBSITE', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'REFERRAL', 'DIRECT', 'OTHER']),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user permissions
      if (!['ADMIN', 'SALES'].includes(ctx.session.user.role)) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      
      // Business logic
      const contact = await ctx.db.contact.create({
        data: {
          ...input,
          venueId: ctx.session.user.venueId,
        },
      });
      
      // Trigger side effects (webhooks, notifications, etc.)
      await triggerLeadNotification(contact);
      
      return contact;
    }),
});
```

## Database Architecture

### Prisma Integration
```typescript
// Database client setup
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

### Data Access Patterns
```typescript
// Repository-like pattern using Prisma
export class ContactService {
  constructor(private db: PrismaClient) {}
  
  async findMany(filters: ContactFilters) {
    return this.db.contact.findMany({
      where: {
        venueId: filters.venueId,
        status: filters.status,
        OR: filters.search ? [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ] : undefined,
      },
      include: {
        opportunities: true,
        _count: {
          select: { interactions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  
  async calculateLeadHeat(contactId: string) {
    const interactions = await this.db.interaction.findMany({
      where: { contactId },
      orderBy: { createdAt: 'desc' },
    });
    
    // Lead heat calculation logic
    const heat = interactions.reduce((score, interaction) => {
      return score + this.getInteractionScore(interaction.type);
    }, 0);
    
    await this.db.contact.update({
      where: { id: contactId },
      data: { leadHeat: heat },
    });
    
    return heat;
  }
  
  private getInteractionScore(type: InteractionType): number {
    const scores = {
      SOCIAL_FOLLOW: 1,
      SOCIAL_LIKE: 1,
      WEBSITE_VISIT: 2,
      INFO_REQUEST: 5,
      PRICE_QUOTE: 8,
      SITE_VISIT: 10,
    };
    return scores[type] ?? 0;
  }
}
```

## Authentication and Authorization

### NextAuth.js Configuration
```typescript
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { db } from '@/server/db';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.venueId = user.venueId;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role;
        session.user.venueId = token.venueId;
      }
      return session;
    },
  },
};
```

### Authorization Middleware
```typescript
import { type GetServerSidePropsContext } from 'next';
import { getServerAuthSession } from '@/server/auth';
import { TRPCError } from '@trpc/server';

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;
  const session = await getServerAuthSession({ req, res });

  return {
    session,
    db,
  };
};

export const protectedProcedure = publicProcedure.use(
  ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  }
);
```
