import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface AffiliateWelcomeEmailProps {
  name: string;
  plan: string;
  planPrice: string;
}

export const AffiliateWelcomeEmail = ({
  name,
  plan,
  planPrice,
}: AffiliateWelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Text style={heading}>Welcome to Tubira Affiliate Program!</Text>
            <Text style={paragraph}>Dear {name},</Text>
            <Text style={paragraph}>
              Thank you for joining the Tubira Affiliate Program. We're excited
              to have you on board!
            </Text>
            <Text style={paragraph}>
              <strong>Your Plan:</strong> {plan}
            </Text>
            <Text style={paragraph}>
              <strong>Amount Paid:</strong> {planPrice}
            </Text>
            <Text style={paragraph}>
              You will receive access to your affiliate dashboard shortly. Our
              team will be in touch with you within 24-48 hours to help you get
              started.
            </Text>
            <Hr style={hr} />
            <Text style={footer}>
              Best regards,<br />
              The Tubira Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
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
  fontSize: "24px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#484848",
  margin: "0 0 20px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#484848",
  margin: "0 0 16px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#6c757d",
  margin: "0",
};

export default AffiliateWelcomeEmail;

