import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PLANS } from "@/lib/constants";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, formData } = body;

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

    const baseUrl = 'https://affiliates.tubira.ai';

    // Create Stripe Checkout Session with form data in metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card","us_bank_account", "sepa_debit", "au_becs_debit", 'alipay', 'wechat_pay', 'bancontact', 'bacs_debit', 'eps', 'giropay', 'ideal', 'p24', 'sofort'],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: planDetails.name,
              description: `One-time setup fee for ${planDetails.name}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
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
      },
      customer_email: formData.email,
    });

    // Create payment record (without affiliateId - will be linked after affiliate is created in webhook)
    await convex.mutation(api.payments.create, {
      affiliateId: undefined,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: undefined,
      stripeCustomerId: undefined,
      amount,
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

