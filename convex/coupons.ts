import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    code: v.string(),
    discountPercentage: v.number(),
    maxUsage: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    createdBy: v.id("admins"),
  },
  handler: async (ctx, args) => {
    // Validate discount percentage
    if (args.discountPercentage < 0 || args.discountPercentage > 100) {
      throw new Error("Discount percentage must be between 0 and 100");
    }

    // Check if code already exists
    const existing = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (existing) {
      throw new Error("Coupon code already exists");
    }

    const now = Date.now();
    const couponId = await ctx.db.insert("coupons", {
      code: args.code.toUpperCase(),
      discountPercentage: args.discountPercentage,
      isActive: true,
      usageCount: 0,
      maxUsage: args.maxUsage,
      expiresAt: args.expiresAt,
      createdAt: now,
      createdBy: args.createdBy,
    });

    return couponId;
  },
});

export const list = query({
  handler: async (ctx) => {
    const coupons = await ctx.db.query("coupons").collect();
    return coupons.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getByCode = query({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!coupon) {
      return null;
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return null;
    }

    // Check if coupon has expired
    if (coupon.expiresAt && coupon.expiresAt < Date.now()) {
      return null;
    }

    // Check if coupon has reached max usage
    if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
      return null;
    }

    return coupon;
  },
});

export const validate = query({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!coupon) {
      return { valid: false, error: "Invalid coupon code" };
    }

    if (!coupon.isActive) {
      return { valid: false, error: "Coupon is not active" };
    }

    if (coupon.expiresAt && coupon.expiresAt < Date.now()) {
      return { valid: false, error: "Coupon has expired" };
    }

    if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
      return { valid: false, error: "Coupon usage limit reached" };
    }

    return {
      valid: true,
      discountPercentage: coupon.discountPercentage,
    };
  },
});

export const incrementUsage = mutation({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    await ctx.db.patch(coupon._id, {
      usageCount: coupon.usageCount + 1,
    });
  },
});

export const toggleActive = mutation({
  args: {
    couponId: v.id("coupons"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.couponId, {
      isActive: args.isActive,
    });
  },
});

export const deleteCoupon = mutation({
  args: {
    couponId: v.id("coupons"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.couponId);
  },
});
