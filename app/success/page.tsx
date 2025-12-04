"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { TUBIRA_URL } from "@/lib/constants";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const paymentIntentId = searchParams.get("payment_intent"); // Backward compatibility
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      window.location.href = TUBIRA_URL;
    }
  }, [countdown]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full border-0 shadow-2xl">
        <CardHeader className="text-center bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-white" />
          </div>
          <CardTitle className="text-3xl" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-lg mt-2 text-white/90" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
            Thank you for joining the Tubira Affiliate Program
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {(sessionId || paymentIntentId) && (
            <p className="text-sm text-gray-600 text-center" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              {sessionId ? `Session ID: ${sessionId}` : `Payment ID: ${paymentIntentId}`}
            </p>
          )}
          <p className="text-center text-gray-700" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
            You will be redirected to Tubira.ai in {countdown} seconds...
          </p>
          <div className="flex flex-col gap-2">
            <Button 
              asChild 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg py-6 text-lg font-semibold shadow-lg" 
              size="lg"
              style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
            >
              <Link href={TUBIRA_URL}>Go to Tubira.ai Now</Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="w-full rounded-lg border-2 py-6 text-lg font-semibold"
              style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
            >
              <Link href="/">Back to Affiliate Page</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full border-0 shadow-2xl">
          <CardHeader className="text-center bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
            </div>
            <CardTitle className="text-3xl" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              Loading...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <p className="text-center text-gray-700" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              Please wait...
            </p>
          </CardContent>
        </Card>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

