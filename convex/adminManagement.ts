import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const list = query({
  handler: async (ctx) => {
    const admins = await ctx.db.query("admins").collect();
    return admins.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const updateRole = mutation({
  args: {
    adminId: v.id("admins"),
    role: v.union(
      v.literal("super_admin"),
      v.literal("financial_agent"),
      v.literal("b2b_agent")
    ),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId);
    if (!admin) {
      throw new Error("Admin not found");
    }
    await ctx.db.patch(args.adminId, {
      role: args.role,
    });
  },
});

export const deleteAdmin = mutation({
  args: {
    adminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    // Delete all sessions for this admin
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_admin", (q) => q.eq("adminId", args.adminId))
      .collect();
    
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    // Delete the admin
    await ctx.db.delete(args.adminId);
  },
});

export const getById = query({
  args: {
    adminId: v.id("admins"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.adminId);
  },
});
