"use client";

import { useEffect, Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PLANS } from "@/lib/constants";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = (searchParams.get("plan") as "standard" | "standard" | "premium") || "standard";
  const [formData, setFormData] = useState<{
    couponCode?: string | null;
    discountPercentage?: number;
  } | null>(null);

  useEffect(() => {
    // Get form data from sessionStorage
    const formDataStr = sessionStorage.getItem("affiliate_form_data");
    if (!formDataStr) {
      toast.error("Missing form information. Please fill out the form again.");
      router.push("/register");
      return;
    }

    const parsedFormData = JSON.parse(formDataStr);
    setFormData({
      couponCode: parsedFormData.couponCode || null,
      discountPercentage: parsedFormData.discountPercentage || 0,
    });

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
              name: parsedFormData.name,
              email: parsedFormData.email,
              phone: parsedFormData.phone,
              company: parsedFormData.company,
              website: parsedFormData.website,
              country: parsedFormData.country,
              address: parsedFormData.address,
            },
            couponCode: parsedFormData.couponCode || null,
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
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-center" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              Redirecting to Checkout...
            </CardTitle>
            <CardDescription className="text-center" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              {planDetails.name} - {planDetails.priceDisplay}/year
              {formData?.couponCode && formData?.discountPercentage && formData.discountPercentage > 0 && (
                <span className="block text-green-600 mt-1">
                  {formData.discountPercentage}% discount applied
                </span>
              )}
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-white py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-center" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                Loading...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  Please wait...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
