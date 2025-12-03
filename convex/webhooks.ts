import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const handleStripeWebhook = internalMutation({
  args: {
    type: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const { type, data } = args;

    // Handle Checkout Session Completed (for Checkout Sessions)
    if (type === "checkout.session.completed") {
      const session = data.object;
      const checkoutSessionId = session.id;
      const paymentIntentId = session.payment_intent as string | null;
      const metadata = session.metadata || {};

      // Check if affiliate already exists (for backward compatibility)
      let affiliate = await ctx.db
        .query("affiliates")
        .withIndex("by_stripe_checkout_session", (q) =>
          q.eq("stripeCheckoutSessionId", checkoutSessionId)
        )
        .first();

      // If affiliate doesn't exist, create it from metadata (new flow)
      if (!affiliate && metadata.email && metadata.name) {
        const now = Date.now();
        const affiliateId = await ctx.db.insert("affiliates", {
          email: metadata.email,
          name: metadata.name,
          phone: metadata.phone || undefined,
          company: metadata.company || undefined,
          website: metadata.website || undefined,
          plan: metadata.plan === "premium" ? "premium" : "standard",
          planPrice: parseInt(metadata.planPrice || "0"),
          status: "paid", // Set to paid immediately since payment succeeded
          stripeCheckoutSessionId: checkoutSessionId,
          stripePaymentIntentId: paymentIntentId || undefined,
          stripeCustomerId: session.customer as string || undefined,
          createdAt: now,
          updatedAt: now,
        });

        affiliate = await ctx.db.get(affiliateId);

        // Create activity log for signup
        await ctx.db.insert("activities", {
          affiliateId,
          type: "signup",
          description: `New affiliate signup: ${metadata.name} (${metadata.email})`,
          createdAt: now,
        });
      }

      if (affiliate) {
        // Update payment status
        const payment = await ctx.db
          .query("payments")
          .withIndex("by_stripe_checkout_session", (q) =>
            q.eq("stripeCheckoutSessionId", checkoutSessionId)
          )
          .first();

        if (payment) {
          await ctx.db.patch(payment._id, {
            affiliateId: affiliate._id,
            status: "succeeded",
            stripePaymentIntentId: paymentIntentId || undefined,
            stripeCustomerId: session.customer as string || undefined,
          });
        }

        // Update affiliate status if not already paid
        if (affiliate.status !== "paid") {
          await ctx.db.patch(affiliate._id, {
            status: "paid",
            stripePaymentIntentId: paymentIntentId || undefined,
            stripeCustomerId: session.customer as string || undefined,
            stripeCheckoutSessionId: checkoutSessionId,
            updatedAt: Date.now(),
          });
        }

        // Create activity log for payment
        await ctx.db.insert("activities", {
          affiliateId: affiliate._id,
          type: "payment",
          description: `Payment confirmed: $${(session.amount_total / 100).toFixed(2)}`,
          amount: session.amount_total,
          createdAt: Date.now(),
        });
      }
    }
    // Handle Payment Intent Succeeded (for backward compatibility or direct Payment Intents)
    else if (type === "payment_intent.succeeded") {
      const paymentIntent = data.object;
      const paymentIntentId = paymentIntent.id;

      // Find affiliate by payment intent ID
      const affiliate = await ctx.db
        .query("affiliates")
        .withIndex("by_stripe_payment_intent", (q) =>
          q.eq("stripePaymentIntentId", paymentIntentId)
        )
        .first();

      if (affiliate) {
        // Update payment status
        const payment = await ctx.db
          .query("payments")
          .withIndex("by_stripe_payment_intent", (q) =>
            q.eq("stripePaymentIntentId", paymentIntentId)
          )
          .first();

        if (payment) {
          await ctx.db.patch(payment._id, {
            status: "succeeded",
          });
        }

        // Update affiliate status
        await ctx.db.patch(affiliate._id, {
          status: "paid",
          updatedAt: Date.now(),
        });

        // Create activity log
        await ctx.db.insert("activities", {
          affiliateId: affiliate._id,
          type: "payment",
          description: `Payment confirmed: $${(paymentIntent.amount / 100).toFixed(2)}`,
          amount: paymentIntent.amount,
          createdAt: Date.now(),
        });
      }
    } else if (type === "payment_intent.payment_failed") {
      const paymentIntent = data.object;
      const paymentIntentId = paymentIntent.id;

      const payment = await ctx.db
        .query("payments")
        .withIndex("by_stripe_payment_intent", (q) =>
          q.eq("stripePaymentIntentId", paymentIntentId)
        )
        .first();

      if (payment) {
        await ctx.db.patch(payment._id, {
          status: "failed",
        });
      }
    } else if (type === "charge.refunded") {
      const charge = data.object;
      const paymentIntentId = charge.payment_intent;

      const payment = await ctx.db
        .query("payments")
        .withIndex("by_stripe_payment_intent", (q) =>
          q.eq("stripePaymentIntentId", paymentIntentId)
        )
        .first();

      if (payment) {
        await ctx.db.patch(payment._id, {
          status: "refunded",
        });

        // Create activity log
        await ctx.db.insert("activities", {
          affiliateId: payment.affiliateId,
          type: "refund",
          description: `Refund processed: $${(charge.amount_refunded / 100).toFixed(2)}`,
          amount: -charge.amount_refunded,
          createdAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});
