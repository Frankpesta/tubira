"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PaymentsPage() {
  const payments = useQuery(api.payments.getAll);
  const stats = useQuery(api.payments.getStats);

  const handleExport = () => {
    if (!payments || payments.length === 0) {
      toast.error("No data to export");
      return;
    }

    const csv = [
      ["Payment ID", "Amount", "Currency", "Plan", "Status", "Created At"],
      ...payments.map((p) => [
        p.stripePaymentIntentId,
        `$${(p.amount / 100).toFixed(2)}`,
        p.currency.toUpperCase(),
        p.plan,
        p.status,
        format(new Date(p.createdAt), "yyyy-MM-dd HH:mm:ss"),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <AdminLayout>
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              Payments
            </h1>
            <p className="text-gray-600 text-base lg:text-lg" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              View all payment transactions
            </p>
          </div>
          <Button 
            onClick={handleExport}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-lg w-full sm:w-auto"
            style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {stats && (
          <div className="grid gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
                <CardTitle className="text-sm font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl lg:text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  {formatCurrency(stats.totalRevenue)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
                <CardTitle className="text-sm font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  Standard Plan Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl lg:text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  {formatCurrency(stats.standardRevenue)}
                </div>
                <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  {stats.standardCount} payments
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-100 rounded-t-lg">
                <CardTitle className="text-sm font-semibold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  Premium Plan Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-2xl lg:text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  {formatCurrency(stats.premiumRevenue)}
                </div>
                <p className="text-xs text-gray-600 mt-1" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  {stats.premiumCount} payments
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-lg lg:text-xl" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              All Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 lg:pt-6">
            {payments === undefined ? (
              <div className="text-center py-8" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                Loading...
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 text-gray-500" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                No payments found
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 lg:mx-0">
                <div className="inline-block min-w-full align-middle px-4 lg:px-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2">
                        <TableHead className="text-xs lg:text-sm hidden lg:table-cell" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Payment Intent ID</TableHead>
                        <TableHead className="text-xs lg:text-sm" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Amount</TableHead>
                        <TableHead className="text-xs lg:text-sm" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Plan</TableHead>
                        <TableHead className="text-xs lg:text-sm" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Status</TableHead>
                        <TableHead className="text-xs lg:text-sm hidden md:table-cell" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment._id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-mono text-xs lg:text-sm hidden lg:table-cell break-all" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                            {payment.stripePaymentIntentId || payment.stripeCheckoutSessionId || "-"}
                          </TableCell>
                          <TableCell className="font-semibold text-xs lg:text-sm" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell className="capitalize font-semibold text-xs lg:text-sm" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                            {payment.plan}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 lg:px-3 py-1 rounded-full text-xs font-semibold ${
                                payment.status === "succeeded"
                                  ? "bg-green-100 text-green-800"
                                  : payment.status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : payment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                              style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
                            >
                              {payment.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs lg:text-sm hidden md:table-cell" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                            {format(new Date(payment.createdAt), "MMM dd, yyyy HH:mm")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

