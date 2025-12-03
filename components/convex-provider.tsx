"use client";

import { ConvexProvider as ConvexProviderBase } from "convex/react";
import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";

const convex = new ConvexReactClient(convexUrl);

export function ConvexProvider({ children }: { children: React.ReactNode }) {
  if (!convexUrl) {
    console.warn("NEXT_PUBLIC_CONVEX_URL is not set. Convex features will not work.");
  }
  return <ConvexProviderBase client={convex}>{children}</ConvexProviderBase>;
}
