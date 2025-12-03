import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";

// Internal mutation for creating admin (called by action)
export const createAdminInternal = internalMutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const adminId = await ctx.db.insert("admins", {
      email: args.email,
      passwordHash: args.passwordHash,
      name: args.name,
      createdAt: Date.now(),
    });
    return adminId;
  },
});

// Internal query to check if admin exists
export const checkAdminExists = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return admin !== null;
  },
});

// Internal mutation for login operations
export const createSessionInternal = internalMutation({
  args: {
    adminId: v.id("admins"),
    token: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("sessions", {
      adminId: args.adminId,
      token: args.token,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
    });
  },
});

export const updateLastLoginInternal = internalMutation({
  args: { adminId: v.id("admins") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.adminId, {
      lastLoginAt: Date.now(),
    });
  },
});

export const getAdminByEmailInternal = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Query for verifying session (doesn't need Node.js)
export const verifySession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const admin = await ctx.db.get(session.adminId);
    if (!admin) {
      return null;
    }

    return {
      id: admin._id,
      email: admin.email,
      name: admin.name,
    };
  },
});

// Mutation for logout (doesn't need Node.js)
export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

// Internal mutation for password reset token
export const createPasswordResetTokenInternal = internalMutation({
  args: {
    adminId: v.id("admins"),
    token: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("passwordResetTokens", {
      adminId: args.adminId,
      token: args.token,
      expiresAt: args.expiresAt,
      used: false,
      createdAt: Date.now(),
    });
  },
});

// Internal mutation for resetting password
export const resetPasswordInternal = internalMutation({
  args: {
    adminId: v.id("admins"),
    passwordHash: v.string(),
    resetTokenId: v.id("passwordResetTokens"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.adminId, {
      passwordHash: args.passwordHash,
    });

    await ctx.db.patch(args.resetTokenId, {
      used: true,
    });
  },
});

export const getPasswordResetTokenInternal = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
  },
});
