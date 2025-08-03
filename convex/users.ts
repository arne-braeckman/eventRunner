import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./auth";

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    role: v.union(
      v.literal("ADMIN"),
      v.literal("SALES"),
      v.literal("PROJECT_MANAGER"),
      v.literal("STAFF"),
      v.literal("CLIENT")
    ),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      image: args.image,
      role: args.role,
    });
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("ADMIN"),
      v.literal("SALES"),
      v.literal("PROJECT_MANAGER"),
      v.literal("STAFF"),
      v.literal("CLIENT")
    ),
  },
  handler: async (ctx, args) => {
    // Only ADMIN users can update roles
    await requireRole(ctx, "ADMIN");
    
    return await ctx.db.patch(args.userId, { role: args.role });
  },
});

export const getAllUsers = query({
  handler: async (ctx) => {
    // Only ADMIN users can view all users
    await requireRole(ctx, "ADMIN");
    
    return await ctx.db.query("users").collect();
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    // Look up user based on Clerk identity
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email || ""))
      .first();
    
    return existingUser;
  },
});

export const createOrGetCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }
    
    // Look up user based on Clerk identity
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email || ""))
      .first();
    
    if (existingUser) {
      return existingUser;
    }
    
    // Create user from Clerk identity if they don't exist
    if (identity.email) {
      const newUserId = await ctx.db.insert("users", {
        name: identity.name || identity.nickname,
        email: identity.email,
        image: identity.pictureUrl,
        role: "STAFF", // Default role
      });
      return await ctx.db.get(newUserId);
    }
    
    throw new Error("Unable to create user: no email provided");
  },
});

// Mutation to ensure user exists - call this when user first signs in
export const ensureUserExists = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }
    
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email || ""))
      .first();
    
    if (existingUser) {
      return existingUser;
    }
    
    // Create user if they don't exist
    if (identity.email) {
      const newUserId = await ctx.db.insert("users", {
        name: identity.name || identity.nickname,
        email: identity.email,
        image: identity.pictureUrl,
        role: "STAFF", // Default role
      });
      return await ctx.db.get(newUserId);
    }
    
    throw new Error("Unable to create user: no email provided");
  },
});
