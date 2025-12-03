import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ConvexProvider } from "@/components/convex-provider";
import { WhatsAppWidget } from "@/components/whatsapp-widget";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Tubira Affiliate Program",
  description: "Join the Tubira Affiliate Program and earn while helping travelers explore the world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} font-sans antialiased`}
      >
        <ConvexProvider>
          {children}
          <WhatsAppWidget />
          <Toaster />
        </ConvexProvider>
      </body>
    </html>
  );
}
