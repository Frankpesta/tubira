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

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAction(api.authActions.login);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (!result || !result.token) {
        throw new Error("Invalid response from server");
      }

      // Store token in localStorage
      localStorage.setItem("admin_token", result.token);
      localStorage.setItem("admin_data", JSON.stringify(result.admin));

      // Also set cookie for server-side access
      document.cookie = `admin_token=${result.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

      toast.success("Login successful!");
      
      // Use router.push for client-side navigation
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="text-3xl text-center" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
            Admin Login
          </CardTitle>
          <CardDescription className="text-center text-white/90" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
            Sign in to access the admin dashboard
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
                placeholder="Enter your password"
                className="h-12 rounded-lg border-2 focus:border-blue-500"
              />
            </div>

            <div className="text-right">
              <a
                href="/admin/forgot-password"
                className="text-sm text-primary hover:underline font-medium" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
              >
                Forgot password?
              </a>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg py-6 text-lg font-semibold shadow-lg" 
              size="lg" 
              disabled={isLoading}
              style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

