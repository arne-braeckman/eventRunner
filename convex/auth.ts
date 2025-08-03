// Convex auth functions for Clerk integration
// These are helper functions that work with Clerk's JWT tokens

import type { UserIdentity } from "convex/server";
import { query } from "./_generated/server";
import { v } from "convex/values";

// Role hierarchy - higher values have more permissions
const ROLE_HIERARCHY = {
  CLIENT: 1,
  STAFF: 2,
  SALES: 3,
  PROJECT_MANAGER: 4,
  ADMIN: 5,
} as const;

type UserRole = keyof typeof ROLE_HIERARCHY;

// Query to get current user information
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    return {
      id: identity.subject,
      name: identity.name || identity.nickname || "Anonymous",
      email: identity.email,
      picture: identity.pictureUrl,
    };
  },
});

/**
 * Check if user has required role or higher
 */
export const checkUserRole = query({
  args: { 
    requiredRole: v.union(
      v.literal("ADMIN"),
      v.literal("SALES"),
      v.literal("PROJECT_MANAGER"),
      v.literal("STAFF"),
      v.literal("CLIENT")
    )
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { hasPermission: false, reason: "Not authenticated" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email || ""))
      .first();

    if (!user) {
      return { hasPermission: false, reason: "User not found" };
    }

    const userRole = user.role || "STAFF";
    const userLevel = ROLE_HIERARCHY[userRole as UserRole];
    const requiredLevel = ROLE_HIERARCHY[args.requiredRole as UserRole];

    return {
      hasPermission: userLevel >= requiredLevel,
      userRole,
      requiredRole: args.requiredRole,
      reason: userLevel >= requiredLevel ? "Access granted" : "Insufficient permissions"
    };
  },
});

/**
 * Get current user with role information and permissions
 */
export const getCurrentUserWithRole = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email || ""))
      .first();

    // If user doesn't exist, return default STAFF permissions
    // The user will be created on their first mutation (like creating a contact)
    if (!user) {
      return {
        _id: null,
        email: identity.email,
        name: identity.name || identity.nickname,
        role: "STAFF",
        permissions: {
          canManageUsers: false,
          canManageContacts: false,
          canManageProjects: false,
          canViewDashboard: true,
          canAccessClientPortal: true,
        }
      };
    }

    const userRole = user.role || "STAFF";
    const userLevel = ROLE_HIERARCHY[userRole as UserRole];

    return {
      ...user,
      permissions: {
        canManageUsers: userLevel >= ROLE_HIERARCHY.ADMIN,
        canManageContacts: userLevel >= ROLE_HIERARCHY.SALES,
        canManageProjects: userLevel >= ROLE_HIERARCHY.PROJECT_MANAGER,
        canViewDashboard: userLevel >= ROLE_HIERARCHY.STAFF,
        canAccessClientPortal: userLevel >= ROLE_HIERARCHY.CLIENT,
      }
    };
  },
});

// Helper function to require authentication
export const requireAuth = async (ctx: any): Promise<UserIdentity> => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  return identity;
};

/**
 * Require minimum role for access (throws error if insufficient)
 * For queries: only checks existing users
 * For mutations: can create users if they don't exist
 */
export const requireRole = async (
  ctx: any,
  requiredRole: UserRole
): Promise<{ _id: string; email: string; role: string; name?: string }> => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }

  let user = await ctx.db
    .query("users")
    .withIndex("email", (q: any) => q.eq("email", identity.email || ""))
    .first();

  // If user doesn't exist and this is a mutation context, create them
  if (!user && identity.email && ctx.db.insert) {
    const newUserId = await ctx.db.insert("users", {
      name: identity.name || identity.nickname,
      email: identity.email,
      image: identity.pictureUrl,
      role: "STAFF", // Default role
    });
    user = await ctx.db.get(newUserId);
  }

  if (!user) {
    throw new Error("User not found. Please refresh the page or contact support.");
  }

  const userRole = user.role || "STAFF";
  const userLevel = ROLE_HIERARCHY[userRole as UserRole];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];

  if (userLevel < requiredLevel) {
    throw new Error(`Access denied. Required role: ${requiredRole}, User role: ${userRole}`);
  }

  return user;
};