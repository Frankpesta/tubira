"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AdminSidebar } from "./sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check for token in localStorage
    const adminToken = localStorage.getItem("admin_token");
    setToken(adminToken);
    setIsLoading(false);
    setIsChecking(false);

    // Only redirect if we're sure there's no token
    if (!adminToken) {
      router.push("/admin/login");
      return;
    }
  }, [router]);

  const admin = useQuery(
    api.auth.verifySession,
    token ? { token } : "skip"
  );

  useEffect(() => {
    // Only redirect if we've finished checking and there's definitely no valid session
    if (!isChecking && !isLoading && token && admin === null) {
      // Token exists but verification failed - invalid token
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_data");
      document.cookie = "admin_token=; path=/; max-age=0";
      router.push("/admin/login");
    }
  }, [admin, isLoading, isChecking, router, token]);

  // Show loading while checking or verifying
  if (isLoading || isChecking || (token && admin === undefined)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // If no token, don't render (will redirect)
  if (!token) {
    return null;
  }

  // If token exists but admin verification failed, don't render (will redirect)
  if (admin === null) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
        {/* Mobile menu button */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b shadow-sm p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <div className="container mx-auto p-4 lg:p-6">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}

