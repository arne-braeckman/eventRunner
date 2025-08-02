import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

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
      .withIndex("by_email", (q) => q.eq("email", args.email))
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
      .withIndex("by_email", (q) => q.eq("email", args.email))
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
    return await ctx.db.patch(args.userId, { role: args.role });
  },
});

export const getAllUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});