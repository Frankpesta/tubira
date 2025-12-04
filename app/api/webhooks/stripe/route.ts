import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    await convex.action(api.webhooks.handleStripeWebhook, {
      type: event.type,
      data: event.data,
    });

    // Send welcome email if payment succeeded
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const affiliateId = session.metadata?.affiliateId;
      const email = session.metadata?.email || session.customer_email;
      const plan = session.metadata?.plan;
      const amount = session.amount_total;

      if (affiliateId && email && plan && amount !== null && amount !== undefined) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: email,
              name: session.metadata?.name || "Affiliate",
              plan: plan === "standard" ? "Standard Plan" : "Premium Plan",
              planPrice: `$${(amount / 100).toFixed(2)}`,
            }),
          });
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
          // Don't fail the webhook if email fails
        }
      }
    } else if (event.type === "payment_intent.succeeded") {
      // Backward compatibility for Payment Intents
      const paymentIntent = event.data.object;
      const affiliateId = paymentIntent.metadata?.affiliateId;
      const email = paymentIntent.metadata?.email;
      const plan = paymentIntent.metadata?.plan;
      const amount = paymentIntent.amount;

      if (affiliateId && email && plan) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: email,
              name: paymentIntent.metadata?.name || "Affiliate",
              plan: plan === "standard" ? "Standard Plan" : "Premium Plan",
              planPrice: `$${(amount / 100).toFixed(2)}`,
            }),
          });
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
          // Don't fail the webhook if email fails
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

