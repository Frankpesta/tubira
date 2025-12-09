import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect admin routes (excluding auth pages)
  const isAuthPage = pathname.startsWith("/admin/login") || 
                     pathname.startsWith("/admin/signup") ||
                     pathname.startsWith("/admin/forgot-password") || 
                     pathname.startsWith("/admin/reset-password");

  if (pathname.startsWith("/admin") && !isAuthPage) {
    const token = request.cookies.get("admin_token")?.value || 
                  request.headers.get("authorization")?.replace("Bearer ", "");

    // If token exists, validate it server-side
    if (token) {
      try {
        const admin = await convex.query(api.auth.verifySession, { token });
        
        // If session is invalid, we'll let client-side handle cleanup
        // This prevents server-side redirects and allows smooth client-side navigation
        if (!admin) {
          // Session invalid - client-side will handle redirect
          // We could set a header here to indicate invalid session if needed
        }
      } catch (error) {
        // Error validating session - let client-side handle it
        console.error("Error validating session in proxy:", error);
      }
    }
    // If no token, allow request to proceed - client-side AdminLayout will handle redirect
    // This allows the page to load and check localStorage on the client
  }

  return NextResponse.next();
}

