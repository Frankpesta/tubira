"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const createResetToken = useAction(api.authActions.createPasswordResetToken);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = await createResetToken({ email });

      if (token) {
        // In production, send email with reset link
        // For now, we'll show the token (in production, this would be emailed)
        toast.success("Password reset token generated. Check your email.");
        setSent(true);
      } else {
        // Don't reveal if email exists
        toast.success("If an account exists, a password reset link has been sent.");
        setSent(true);
      }
    } catch (error) {
      toast.error("Failed to process request");
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              Check Your Email
            </CardTitle>
            <CardDescription className="text-center text-white/90" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              If an account exists, we've sent a password reset link to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg py-6 text-lg font-semibold shadow-lg" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              <Link href="/admin/login">Back to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="text-3xl text-center" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
            Forgot Password
          </CardTitle>
          <CardDescription className="text-center text-white/90" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="h-12 rounded-lg border-2 focus:border-blue-500"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg py-6 text-lg font-semibold shadow-lg" 
              size="lg" 
              disabled={isLoading}
              style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>

            <div className="text-center text-sm text-gray-600" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              <Link href="/admin/login" className="text-primary hover:underline font-medium">
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

