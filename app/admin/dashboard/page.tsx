"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const [token] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_token");
    }
    return null;
  });

  const admin = useQuery(
    api.auth.verifySession,
    token ? { token } : "skip"
  );

  const adminRole = admin?.role || "b2b_agent"; // Default to b2b_agent if role is missing

  // Role-based data fetching
  const affiliates = useQuery(
    adminRole === "financial_agent" ? undefined : api.affiliates.getAll
  );
  const stats = useQuery(
    adminRole === "b2b_agent" ? undefined : api.payments.getStats
  );

  const totalAffiliates = affiliates?.length || 0;
  const paidAffiliates = affiliates?.filter((a: Doc<"affiliates">) => a.status === "paid").length || 0;
  const pendingAffiliates = affiliates?.filter((a: Doc<"affiliates">) => a.status === "pending").length || 0;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <AdminLayout>
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
            Dashboard
          </h1>
          <p className="text-gray-600 text-base lg:text-lg" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
            Overview of affiliate program performance
          </p>
        </div>

        <div className={`grid gap-4 lg:gap-6 ${adminRole === "super_admin" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : adminRole === "financial_agent" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"}`}>
          {/* Show affiliate stats for b2b_agent and super_admin */}
          {(adminRole === "b2b_agent" || adminRole === "super_admin") && (
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
                <CardTitle className="text-sm font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  Total Affiliates
                </CardTitle>
                <Users className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl lg:text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  {totalAffiliates}
                </div>
                <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  {paidAffiliates} paid, {pendingAffiliates} pending
                </p>
              </CardContent>
            </Card>
          )}

          {/* Show financial stats for financial_agent and super_admin */}
          {(adminRole === "financial_agent" || adminRole === "super_admin") && (
            <>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
                  <CardTitle className="text-sm font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    {stats ? formatCurrency(stats.totalRevenue) : "$0.00"}
                  </div>
                  <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    From {stats?.totalCount || 0} successful payments
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
                  <CardTitle className="text-sm font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    Standard Plan
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    {stats?.standardCount || 0}
                  </div>
                  <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    {stats ? formatCurrency(stats.standardRevenue) : "$0.00"} revenue
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-pink-50 to-pink-100 rounded-t-lg">
                  <CardTitle className="text-sm font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    Premium Plan
                  </CardTitle>
                  <CheckCircle className="h-5 w-5 text-pink-600" />
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    {stats?.premiumCount || 0}
                  </div>
                  <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    {stats ? formatCurrency(stats.premiumRevenue) : "$0.00"} revenue
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Show recent affiliates only for b2b_agent and super_admin */}
        {(adminRole === "b2b_agent" || adminRole === "super_admin") && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-lg lg:text-xl" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                Recent Affiliates
              </CardTitle>
              <CardDescription className="text-white/90 text-sm" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                Latest affiliate registrations
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 lg:pt-6">
              <div className="space-y-3 lg:space-y-4">
                {affiliates && affiliates.length > 0 ? (
                  <div className="space-y-2 lg:space-y-3">
                    {affiliates.slice(0, 5).map((affiliate: Doc<"affiliates">) => (
                    <div
                      key={affiliate._id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 lg:p-4 border-2 rounded-lg hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm lg:text-base" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                          {affiliate.name}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-600 break-all" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                          {affiliate.email}
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:flex-col sm:items-end">
                        <p className="font-semibold capitalize text-gray-900 text-sm lg:text-base" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                          {affiliate.plan}
                        </p>
                        <p className={`text-xs capitalize px-2 py-1 rounded-full inline-block ${
                          affiliate.status === "paid" ? "bg-green-100 text-green-800" :
                          affiliate.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          affiliate.status === "active" ? "bg-blue-100 text-blue-800" :
                          "bg-red-100 text-red-800"
                        }`} style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                          {affiliate.status}
                        </p>
                      </div>
                    </div>
                  ))}
                    </div>
                  ))}
                </div>
                ) : (
                  <p className="text-center text-gray-500 py-8" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    No affiliates yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

