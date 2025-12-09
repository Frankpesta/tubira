"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminSignupPage() {
  const router = useRouter();
  const createAdmin = useAction(api.authActions.createAdmin);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await createAdmin({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      toast.success("Admin account created successfully! Please login.");
      
      // Redirect to login page
      router.push("/admin/login");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create admin account");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="text-3xl text-center" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
            Admin Signup
          </CardTitle>
          <CardDescription className="text-center text-white/90" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
            Create a new admin account
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                Full Name
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
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@example.com"
                className="h-12 rounded-lg border-2 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password (min. 8 characters)"
                className="h-12 rounded-lg border-2 focus:border-blue-500"
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                className="h-12 rounded-lg border-2 focus:border-blue-500"
                minLength={8}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg py-6 text-lg font-semibold shadow-lg" 
              size="lg" 
              disabled={isLoading}
              style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
            >
              {isLoading ? "Creating account..." : "Create Admin Account"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                Already have an account?{" "}
                <Link
                  href="/admin/login"
                  className="text-primary hover:underline font-medium"
                  style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
                >
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
