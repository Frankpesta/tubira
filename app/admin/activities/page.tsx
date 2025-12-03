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

export default function ActivitiesPage() {
  const activities = useQuery(api.activities.getAll);

  const handleExport = () => {
    if (!activities || activities.length === 0) {
      toast.error("No data to export");
      return;
    }

    const csv = [
      ["Type", "Description", "Amount", "Created At"],
      ...activities.map((a) => [
        a.type,
        a.description,
        a.amount ? `$${(a.amount / 100).toFixed(2)}` : "",
        format(new Date(a.createdAt), "yyyy-MM-dd HH:mm:ss"),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activities-${format(new Date(), "yyyy-MM-dd")}.csv`;
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
              Activities
            </h1>
            <p className="text-gray-600 text-base lg:text-lg" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              View all system activities and logs
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

        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-lg lg:text-xl" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              All Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 lg:pt-6">
            {activities === undefined ? (
              <div className="text-center py-8" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                Loading...
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                No activities found
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 lg:mx-0">
                <div className="inline-block min-w-full align-middle px-4 lg:px-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2">
                        <TableHead className="text-xs lg:text-sm" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Type</TableHead>
                        <TableHead className="text-xs lg:text-sm" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Description</TableHead>
                        <TableHead className="text-xs lg:text-sm hidden md:table-cell" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Amount</TableHead>
                        <TableHead className="text-xs lg:text-sm hidden sm:table-cell" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activities.map((activity) => (
                        <TableRow key={activity._id} className="hover:bg-gray-50 transition-colors">
                          <TableCell>
                            <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                              activity.type === "payment"
                                ? "bg-green-100 text-green-800"
                                : activity.type === "signup"
                                ? "bg-blue-100 text-blue-800"
                                : activity.type === "refund"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`} style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                              {activity.type}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-xs lg:text-sm" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                            <div>
                              <div>{activity.description}</div>
                              <div className="text-gray-500 md:hidden text-xs mt-1">
                                {activity.amount ? formatCurrency(Math.abs(activity.amount)) : "-"} • {format(new Date(activity.createdAt), "MMM dd, yyyy")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-xs lg:text-sm hidden md:table-cell" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                            {activity.amount
                              ? formatCurrency(Math.abs(activity.amount))
                              : "-"}
                          </TableCell>
                          <TableCell className="text-xs lg:text-sm hidden sm:table-cell" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                            {format(new Date(activity.createdAt), "MMM dd, yyyy HH:mm")}
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

