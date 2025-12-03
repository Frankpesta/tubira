import { v } from "convex/values";
import { query } from "./_generated/server";

export const getByAffiliate = query({
  args: { affiliateId: v.id("affiliates") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", args.affiliateId))
      .order("desc")
      .collect();
  },
});

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("activities").order("desc").collect();
  },
});

