import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { AffiliateWelcomeEmail } from "@/emails/affiliate-welcome";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(apiKey);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, name, plan, planPrice } = body;

    if (!to || !name || !plan || !planPrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Tubira Affiliates <no-reply@affiliates.tubira.ai>",
      to: [to],
      subject: "Welcome to Tubira Affiliate Program!",
      react: AffiliateWelcomeEmail({
        name,
        plan,
        planPrice,
      }),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}

