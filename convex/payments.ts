import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    affiliateId: v.optional(v.id("affiliates")),
    stripePaymentIntentId: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    plan: v.union(v.literal("standard"), v.literal("premium")),
  },
  handler: async (ctx, args) => {
    // If no affiliateId provided, we'll update it later in the webhook
    const paymentId = await ctx.db.insert("payments", {
      affiliateId: args.affiliateId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
      stripeCustomerId: args.stripeCustomerId,
      amount: args.amount,
      currency: args.currency,
      plan: args.plan,
      status: "pending",
      createdAt: Date.now(),
    });

    // Create activity log only if affiliateId exists
    if (args.affiliateId) {
      await ctx.db.insert("activities", {
        affiliateId: args.affiliateId,
        type: "payment",
        description: `Payment initiated: $${(args.amount / 100).toFixed(2)} for ${args.plan} plan`,
        amount: args.amount,
        createdAt: Date.now(),
      });
    }

    return paymentId;
  },
});

export const updateStatus = mutation({
  args: {
    stripePaymentIntentId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("refunded")
    ),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_stripe_payment_intent", (q) =>
        q.eq("stripePaymentIntentId", args.stripePaymentIntentId)
      )
      .first();

    if (!payment) {
      throw new Error("Payment not found");
    }

    await ctx.db.patch(payment._id, {
      status: args.status,
    });

    // Update affiliate status if payment succeeded
    if (args.status === "succeeded") {
      await ctx.db.patch(payment.affiliateId, {
        status: "paid",
        updatedAt: Date.now(),
      });

      // Create activity log
      await ctx.db.insert("activities", {
        affiliateId: payment.affiliateId,
        type: "payment",
        description: `Payment succeeded: $${(payment.amount / 100).toFixed(2)}`,
        amount: payment.amount,
        createdAt: Date.now(),
      });
    }
  },
});

export const getByAffiliate = query({
  args: { affiliateId: v.id("affiliates") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", args.affiliateId))
      .order("desc")
      .collect();
  },
});

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("payments").order("desc").collect();
  },
});

export const getStats = query({
  handler: async (ctx) => {
    const payments = await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("status"), "succeeded"))
      .collect();

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const standardCount = payments.filter((p) => p.plan === "standard").length;
    const premiumCount = payments.filter((p) => p.plan === "premium").length;
    const standardRevenue = payments
      .filter((p) => p.plan === "standard")
      .reduce((sum, p) => sum + p.amount, 0);
    const premiumRevenue = payments
      .filter((p) => p.plan === "premium")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalRevenue,
      totalCount: payments.length,
      standardCount,
      premiumCount,
      standardRevenue,
      premiumRevenue,
    };
  },
});

