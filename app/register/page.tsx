"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PLANS } from "@/lib/constants";
import { COUNTRIES } from "@/lib/countries";
import { Check, ArrowRight, ArrowLeft, Tag } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planParam = searchParams.get("plan") as "standard" | "premium" | null;
  
  const [selectedPlan, setSelectedPlan] = useState<"standard" | "premium">(
    planParam === "premium" ? "premium" : "standard"
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    website: "",
    country: "",
    address: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCoupon, setUseCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState<number | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const validateCoupon = async (code: string) => {
    if (!code.trim() || code.trim().length < 3) {
      setCouponDiscount(null);
      setCouponError(null);
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError(null);

    try {
      const response = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (data.valid) {
        setCouponDiscount(data.discountPercentage);
        setCouponError(null);
        toast.success(`Coupon applied! ${data.discountPercentage}% discount`);
      } else {
        setCouponDiscount(null);
        setCouponError(data.error || "Invalid coupon code");
        // Don't show toast error on every keystroke, only on explicit validation
      }
    } catch (error) {
      setCouponDiscount(null);
      setCouponError("Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleCouponCodeChange = (value: string) => {
    setCouponCode(value);
    
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Reset discount/error if input is too short
    if (!value.trim() || value.trim().length < 3) {
      setCouponDiscount(null);
      setCouponError(null);
      setIsValidatingCoupon(false);
      return;
    }

    // Set new debounce timer - only validate after 500ms of no typing and at least 3 characters
    debounceTimerRef.current = setTimeout(() => {
      validateCoupon(value);
    }, 500);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const calculatePrice = () => {
    const basePrice = PLANS[selectedPlan].price;
    if (useCoupon && couponDiscount !== null) {
      return Math.round(basePrice * (1 - couponDiscount / 100));
    }
    return basePrice;
  };

  const formatPriceDisplay = (cents: number) => {
    const amount = (cents / 100).toFixed(2);
    // Add comma separators for thousands
    const formatted = amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formatted} USD`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    // Validate coupon if enabled
    if (useCoupon && couponCode.trim()) {
      if (couponDiscount === null || couponError) {
        toast.error("Please enter a valid coupon code");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Store form data in sessionStorage to pass to checkout
      const formDataToStore = {
        ...formData,
        plan: selectedPlan,
        planPrice: PLANS[selectedPlan].price,
        couponCode: useCoupon && couponCode.trim() ? couponCode.trim() : null,
        discountPercentage: useCoupon && couponDiscount !== null ? couponDiscount : 0,
        finalPrice: calculatePrice(),
      };
      sessionStorage.setItem("affiliate_form_data", JSON.stringify(formDataToStore));

      toast.success("Redirecting to checkout...");
      router.push(`/checkout?plan=${selectedPlan}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to proceed");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
            Become a <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Tubira Affiliate</span>
          </h1>
          <p className="text-lg text-gray-600" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
            Fill out the form below to start your affiliate journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form Card */}
          <Card className="border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl text-center" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="h-12 rounded-lg border-2 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="h-12 rounded-lg border-2 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="h-12 rounded-lg border-2 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    Country *
                  </Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData({ ...formData, country: value })}
                    required
                  >
                    <SelectTrigger className="h-12 rounded-lg border-2 focus:border-blue-500 bg-white">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] bg-white">
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    Address *
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street address, City, State/Province"
                    className="h-12 rounded-lg border-2 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    Company Name
                  </Label>
                  <Input
                    id="company"
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Your Company"
                    className="h-12 rounded-lg border-2 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    Website URL
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                    className="h-12 rounded-lg border-2 focus:border-blue-500"
                  />
                </div>

                {/* Coupon Section */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="useCoupon" className="text-sm font-semibold cursor-pointer flex items-center gap-2" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                      <input
                        id="useCoupon"
                        type="checkbox"
                        checked={useCoupon}
                        onChange={(e) => {
                          setUseCoupon(e.target.checked);
                          if (!e.target.checked) {
                            setCouponCode("");
                            setCouponDiscount(null);
                            setCouponError(null);
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Tag className="h-4 w-4" />
                      Have a coupon code?
                    </Label>
                  </div>
                  {useCoupon && (
                    <div className="space-y-2">
                      <Input
                        type="text"
                        value={couponCode}
                        onChange={(e) => handleCouponCodeChange(e.target.value)}
                        placeholder="Enter coupon code"
                        className="h-12 rounded-lg border-2 focus:border-blue-500 uppercase"
                        disabled={isValidatingCoupon}
                      />
                      {isValidatingCoupon && (
                        <p className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                          Validating...
                        </p>
                      )}
                      {couponError && (
                        <p className="text-xs text-red-500" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                          {couponError}
                        </p>
                      )}
                      {couponDiscount !== null && !couponError && (
                        <p className="text-xs text-green-600 font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                          {couponDiscount}% discount applied!
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 text-center mb-2" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  * Annual subscription
                </p>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg py-6 text-lg font-semibold shadow-lg"
                >
                  {isSubmitting ? "Processing..." : (
                    <>
                      Proceed to Checkout - {
                        useCoupon && couponDiscount !== null && !couponError
                          ? (
                            <>
                              <span className="line-through text-white/70 mr-2">{PLANS[selectedPlan].priceDisplay}</span>
                              {formatPriceDisplay(calculatePrice())}
                            </>
                          )
                          : PLANS[selectedPlan].priceDisplay
                      }
                    </>
                  )}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Plan Preview Card */}
          <div className="space-y-4">
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={selectedPlan === "premium" 
                    ? "/p5.jpg"
                    : "/p4.jpg"
                  }
                  alt={selectedPlan === "premium" ? "Premium Plan" : "Standard Plan"}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    {PLANS[selectedPlan].name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    {useCoupon && couponDiscount !== null && !couponError ? (
                      <>
                        <p className="text-2xl font-bold text-white/70 line-through" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                          {PLANS[selectedPlan].priceDisplay}
                        </p>
                        <p className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                          {formatPriceDisplay(calculatePrice())}
                        </p>
                      </>
                    ) : (
                      <p className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                        {PLANS[selectedPlan].priceDisplay}
                      </p>
                    )}
                  </div>
                  {useCoupon && couponDiscount !== null && !couponError && (
                    <p className="text-xs text-green-300 font-semibold mt-1" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                      {couponDiscount}% discount applied!
                    </p>
                  )}
                  <p className="text-xs text-white/80 font-semibold mt-1" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    Annual subscription
                  </p>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  {selectedPlan === "premium" 
                    ? "Perfect for high-volume affiliates who want access to all travel products"
                    : "Ideal for creators and small agencies starting their affiliate journey"
                  }
                </p>
                <div className="space-y-2">
                  {selectedPlan === "premium" ? (
                    <>
                      <p className="text-xs font-semibold text-gray-700 mb-2">Includes everything in Standard, plus:</p>
                      {PLANS.premium.features.map((feature) => (
                        <div key={feature} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-semibold text-gray-700 mb-2">Access to:</p>
                      {PLANS.standard.features.slice(0, 6).map((feature) => (
                        <div key={feature} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Plan Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedPlan("standard")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedPlan === "standard"
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  Standard
                </div>
                <div className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  {selectedPlan === "standard" && useCoupon && couponDiscount !== null && !couponError
                    ? formatPriceDisplay(calculatePrice())
                    : PLANS.standard.priceDisplay}
                </div>
                {selectedPlan === "standard" && useCoupon && couponDiscount !== null && !couponError && (
                  <div className="text-xs text-green-600 font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    {couponDiscount}% off
                  </div>
                )}
                <div className="text-xs text-gray-500 font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  Annual
                </div>
              </button>
              <button
                onClick={() => setSelectedPlan("premium")}
                className={`p-4 rounded-lg border-2 transition-all relative ${
                  selectedPlan === "premium"
                    ? "border-purple-500 bg-purple-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {selectedPlan === "premium" && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                    Popular
                  </span>
                )}
                <div className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  Premium
                </div>
                <div className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  {selectedPlan === "premium" && useCoupon && couponDiscount !== null && !couponError
                    ? formatPriceDisplay(calculatePrice())
                    : PLANS.premium.priceDisplay}
                </div>
                {selectedPlan === "premium" && useCoupon && couponDiscount !== null && !couponError && (
                  <div className="text-xs text-green-600 font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    {couponDiscount}% off
                  </div>
                )}
                <div className="text-xs text-gray-500 font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  Annual
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              Loading...
            </p>
          </div>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
