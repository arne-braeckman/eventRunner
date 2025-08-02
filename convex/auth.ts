// Convex auth functions for Clerk integration
// These are helper functions that work with Clerk's JWT tokens

import type { UserIdentity } from "convex/server";
import { query } from "./_generated/server";

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

// Helper function to require authentication
export const requireAuth = async (ctx: any): Promise<UserIdentity> => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  return identity;
};