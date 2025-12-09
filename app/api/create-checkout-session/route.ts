import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PLANS } from "@/lib/constants";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type Stripe from "stripe";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Helper function to get or create Stripe product and price
async function getOrCreateStripePrice(plan: "standard" | "premium") {
  const planDetails = PLANS[plan];
  const productName = planDetails.name;
  const amount = planDetails.price;

  // Try to find existing product by name
  const products = await stripe.products.list({ limit: 100 });
  let product = products.data.find((p) => p.name === productName);

  if (!product) {
    // Create new product
    product = await stripe.products.create({
      name: productName,
      description: `Annual subscription for ${productName}`,
    });
  }

  // Try to find existing price for this product and amount
  const prices = await stripe.prices.list({
    product: product.id,
    limit: 100,
  });
  let price = prices.data.find(
    (p) =>
      p.unit_amount === amount &&
      p.currency === "usd" &&
      p.recurring?.interval === "year"
  );

  if (!price) {
    // Create new price for annual subscription
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: amount,
      currency: "usd",
      recurring: {
        interval: "year",
      },
    });
  }

  return price.id;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, formData, couponCode } = body;

    if (!plan || (plan !== "standard" && plan !== "premium") || !formData) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.country || !formData.address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const planDetails = PLANS[plan as keyof typeof PLANS];
    const amount = planDetails.price;
    let discountPercentage = 0;
    let finalAmount = amount;

    // Validate and apply coupon if provided
    let stripeCouponId: string | undefined;
    if (couponCode && couponCode.trim()) {
      const couponValidation = await convex.query(api.coupons.validate, {
        code: couponCode.trim(),
      });

      if (couponValidation.valid) {
        const discount = couponValidation.discountPercentage;
        if (typeof discount === "number") {
          discountPercentage = discount;
          finalAmount = Math.round(amount * (1 - discountPercentage / 100)) as typeof amount;

          // Create or get Stripe coupon
          try {
            const stripeCoupons = await stripe.coupons.list({ limit: 100 });
            const existingCoupon = stripeCoupons.data.find(
              (c) => c.id === couponCode.toUpperCase() || c.name === couponCode.toUpperCase()
            );

            if (existingCoupon) {
              stripeCouponId = existingCoupon.id;
            } else {
              // Create a new Stripe coupon
              const newCoupon = await stripe.coupons.create({
                id: couponCode.toUpperCase(),
                percent_off: discountPercentage,
                duration: "once", // Discount applied to the first annual subscription
              });
              stripeCouponId = newCoupon.id;
            }
          } catch (stripeError: unknown) {
            // If coupon ID already exists, try to use it
            if (stripeError && typeof stripeError === "object" && "code" in stripeError && stripeError.code === "resource_already_exists") {
              stripeCouponId = couponCode.toUpperCase();
            } else {
              console.error("Error creating Stripe coupon:", stripeError);
              // Continue without Stripe coupon, we'll handle discount in metadata
            }
          }
        }
      }
    }

    const baseUrl = 'https://affiliates.tubira.ai';

    // Get or create Stripe price for annual subscription
    const priceId = await getOrCreateStripePrice(plan as "standard" | "premium");

    // Create Stripe Checkout Session with subscription mode
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"] as const,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        metadata: {
          plan,
          email: formData.email,
          name: formData.name || "",
          phone: formData.phone || "",
          company: formData.company || "",
          website: formData.website || "",
          country: formData.country || "",
          address: formData.address || "",
          planPrice: amount.toString(),
          originalPrice: amount.toString(),
          discountPercentage: discountPercentage.toString(),
          finalPrice: finalAmount.toString(),
          couponCode: couponCode || "",
        },
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/register?plan=${plan}`,
      metadata: {
        plan,
        email: formData.email,
        name: formData.name || "",
        phone: formData.phone || "",
        company: formData.company || "",
        website: formData.website || "",
        country: formData.country || "",
        address: formData.address || "",
        planPrice: amount.toString(),
        originalPrice: amount.toString(),
        discountPercentage: discountPercentage.toString(),
        finalPrice: finalAmount.toString(),
        couponCode: couponCode || "",
      },
      customer_email: formData.email,
    };

    // Apply coupon if valid
    if (stripeCouponId) {
      sessionConfig.discounts = [{ coupon: stripeCouponId }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Increment coupon usage if coupon was applied
    if (couponCode && couponCode.trim()) {
      try {
        await convex.mutation(api.coupons.incrementUsage, {
          code: couponCode.trim(),
        });
      } catch (error) {
        console.error("Error incrementing coupon usage:", error);
        // Don't fail the checkout if coupon increment fails
      }
    }

    // Create payment record (without affiliateId - will be linked after affiliate is created in webhook)
    await convex.mutation(api.payments.create, {
      affiliateId: undefined,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: undefined,
      stripeCustomerId: undefined,
      amount: finalAmount,
      currency: "usd",
      plan,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

