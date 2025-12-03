"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PLANS } from "@/lib/constants";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = (searchParams.get("plan") as "standard" | "premium") || "standard";

  useEffect(() => {
    // Get form data from sessionStorage
    const formDataStr = sessionStorage.getItem("affiliate_form_data");
    if (!formDataStr) {
      toast.error("Missing form information. Please fill out the form again.");
      router.push("/register");
      return;
    }

    const formData = JSON.parse(formDataStr);

    const createCheckoutSession = async () => {
      try {
        const response = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            plan,
            formData: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              company: formData.company,
              website: formData.website,
            }
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create checkout session");
        }

        const data = await response.json();
        
        // Clear sessionStorage after successful checkout session creation
        sessionStorage.removeItem("affiliate_form_data");
        
        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error("No checkout URL received");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to initialize checkout");
        router.push("/register");
      }
    };

    createCheckoutSession();
  }, [plan, router]);

  const planDetails = PLANS[plan];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              Redirecting to Checkout...
            </CardTitle>
            <CardDescription className="text-center" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              {planDetails.name} - {planDetails.priceDisplay}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                Please wait while we redirect you to secure checkout...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
