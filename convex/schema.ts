import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  affiliates: defineTable({
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    website: v.optional(v.string()),
    plan: v.union(v.literal("standard"), v.literal("premium")),
    planPrice: v.number(), // in cents
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("active"),
      v.literal("rejected")
    ),
    stripePaymentIntentId: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_stripe_payment_intent", ["stripePaymentIntentId"])
    .index("by_stripe_checkout_session", ["stripeCheckoutSessionId"]),

  payments: defineTable({
    affiliateId: v.optional(v.id("affiliates")), // Optional initially, will be set after affiliate creation
    stripePaymentIntentId: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    amount: v.number(), // in cents
    currency: v.string(),
    plan: v.union(v.literal("standard"), v.literal("premium")),
    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    createdAt: v.number(),
  })
    .index("by_affiliate", ["affiliateId"])
    .index("by_stripe_payment_intent", ["stripePaymentIntentId"])
    .index("by_stripe_checkout_session", ["stripeCheckoutSessionId"]),

  admins: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    adminId: v.id("admins"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_admin", ["adminId"]),

  passwordResetTokens: defineTable({
    adminId: v.id("admins"),
    token: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_admin", ["adminId"]),

  activities: defineTable({
    affiliateId: v.id("affiliates"),
    type: v.union(
      v.literal("signup"),
      v.literal("payment"),
      v.literal("status_change"),
      v.literal("refund")
    ),
    description: v.string(),
    amount: v.optional(v.number()), // in cents
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_affiliate", ["affiliateId"])
    .index("by_type", ["type"])
    .index("by_created", ["createdAt"]),
});

