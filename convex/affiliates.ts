import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    website: v.optional(v.string()),
    plan: v.union(v.literal("standard"), v.literal("premium")),
    planPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const affiliateId = await ctx.db.insert("affiliates", {
      email: args.email,
      name: args.name,
      phone: args.phone,
      company: args.company,
      website: args.website,
      plan: args.plan,
      planPrice: args.planPrice,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Create activity log
    await ctx.db.insert("activities", {
      affiliateId,
      type: "signup",
      description: `New affiliate signup: ${args.name} (${args.email})`,
      createdAt: now,
    });

    return affiliateId;
  },
});

export const getById = query({
  args: { id: v.id("affiliates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("affiliates")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("affiliates").order("desc").collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("affiliates"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("active"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    const affiliate = await ctx.db.get(args.id);
    if (!affiliate) {
      throw new Error("Affiliate not found");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // Create activity log
    await ctx.db.insert("activities", {
      affiliateId: args.id,
      type: "status_change",
      description: `Status changed from ${affiliate.status} to ${args.status}`,
      createdAt: Date.now(),
    });
  },
});

export const updatePaymentInfo = mutation({
  args: {
    id: v.id("affiliates"),
    stripePaymentIntentId: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      updatedAt: Date.now(),
    };
    
    if (args.stripePaymentIntentId !== undefined) {
      updateData.stripePaymentIntentId = args.stripePaymentIntentId;
    }
    if (args.stripeCheckoutSessionId !== undefined) {
      updateData.stripeCheckoutSessionId = args.stripeCheckoutSessionId;
    }
    if (args.stripeCustomerId !== undefined) {
      updateData.stripeCustomerId = args.stripeCustomerId;
    }
    
    await ctx.db.patch(args.id, updateData);
  },
});

