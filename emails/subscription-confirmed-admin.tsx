import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

export interface SubscriptionConfirmedAdminEmailProps {
  affiliateName: string;
  affiliateEmail: string;
  plan: string;
  amountPaid: string;
  checkoutSessionId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export const SubscriptionConfirmedAdminEmail = ({
  affiliateName,
  affiliateEmail,
  plan,
  amountPaid,
  checkoutSessionId,
  stripeCustomerId,
  stripeSubscriptionId,
}: SubscriptionConfirmedAdminEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Text style={heading}>Subscription confirmed</Text>
            <Text style={paragraph}>
              A subscription payment was confirmed via Stripe webhook.
            </Text>

            <Hr style={hr} />

            <Text style={paragraph}>
              <strong>Affiliate:</strong> {affiliateName} ({affiliateEmail})
            </Text>
            <Text style={paragraph}>
              <strong>Plan:</strong> {plan}
            </Text>
            <Text style={paragraph}>
              <strong>Amount:</strong> {amountPaid}
            </Text>

            {(checkoutSessionId || stripeCustomerId || stripeSubscriptionId) && (
              <>
                <Hr style={hr} />
                {checkoutSessionId && (
                  <Text style={mono}>
                    Checkout session: {checkoutSessionId}
                  </Text>
                )}
                {stripeCustomerId && (
                  <Text style={mono}>Customer: {stripeCustomerId}</Text>
                )}
                {stripeSubscriptionId && (
                  <Text style={mono}>Subscription: {stripeSubscriptionId}</Text>
                )}
              </>
            )}

            <Hr style={hr} />
            <Text style={footer}>
              Tubira Affiliates — automated notification
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const section = {
  padding: "0 48px",
};

const heading = {
  fontSize: "20px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#111827",
  margin: "0 0 16px",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#111827",
  margin: "0 0 12px",
};

const mono = {
  fontSize: "12px",
  lineHeight: "1.6",
  color: "#374151",
  margin: "0 0 8px",
  fontFamily:
    'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace',
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "16px 0",
};

const footer = {
  fontSize: "12px",
  lineHeight: "1.5",
  color: "#6b7280",
  margin: "0",
};

export default SubscriptionConfirmedAdminEmail;


