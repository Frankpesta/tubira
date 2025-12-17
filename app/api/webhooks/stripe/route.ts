import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Resend } from "resend";
import { SubscriptionConfirmedAdminEmail } from "@/emails/subscription-confirmed-admin";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(apiKey);
}

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

      // Notify super_admin + financial_agent that subscription is confirmed
      try {
        const admins = await convex.query(api.adminManagement.list, {} as any);
        const recipients = Array.from(
          new Set(
            (admins || [])
              .filter(
                (a: any) =>
                  a?.email &&
                  (a?.role === "super_admin" || a?.role === "financial_agent")
              )
              .map((a: any) => a.email)
          )
        );

        if (recipients.length > 0) {
          const resend = getResend();
          const affiliateName = session.metadata?.name || "Affiliate";
          const affiliateEmail = email || "unknown";
          const planLabel = plan === "standard" ? "Standard Plan" : "Premium Plan";
          const amountPaid = amount !== null && amount !== undefined ? `$${(amount / 100).toFixed(2)}` : "N/A";

          const from =
            process.env.RESEND_FROM_EMAIL ||
            "Tubira Affiliates <no-reply@affiliates.tubira.ai>";

          const { error } = await resend.emails.send({
            from,
            to: recipients,
            subject: `Subscription confirmed: ${affiliateName} (${planLabel})`,
            react: SubscriptionConfirmedAdminEmail({
              affiliateName,
              affiliateEmail,
              plan: planLabel,
              amountPaid,
              checkoutSessionId: session.id,
              stripeCustomerId: (session.customer as string) || undefined,
              stripeSubscriptionId: (session.subscription as string) || undefined,
            }),
          });

          if (error) {
            console.error("Failed to send admin subscription notification:", error);
          }
        }
      } catch (notifyError) {
        console.error("Failed to notify admins about subscription confirmation:", notifyError);
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

