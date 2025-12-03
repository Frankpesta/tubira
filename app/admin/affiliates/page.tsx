"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import { Download } from "lucide-react";

export default function AffiliatesPage() {
  const affiliates = useQuery(api.affiliates.getAll);
  const updateStatus = useMutation(api.affiliates.updateStatus);

  const handleStatusChange = async (
    id: string,
    newStatus: "pending" | "paid" | "active" | "rejected"
  ) => {
    try {
      await updateStatus({ id: id as any, status: newStatus });
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleExport = () => {
    if (!affiliates || affiliates.length === 0) {
      toast.error("No data to export");
      return;
    }

    const csv = [
      ["Name", "Email", "Phone", "Company", "Plan", "Status", "Amount", "Created At"],
      ...affiliates.map((a: Doc<"affiliates">) => [
        a.name,
        a.email,
        a.phone || "",
        a.company || "",
        a.plan,
        a.status,
        `$${(a.planPrice / 100).toFixed(2)}`,
        format(new Date(a.createdAt), "yyyy-MM-dd HH:mm:ss"),
      ]),
    ]
      .map((row) => row.map((cell: string | undefined) => `"${cell ?? ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `affiliates-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
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
              Affiliates
            </h1>
            <p className="text-gray-600 text-base lg:text-lg" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              Manage affiliate registrations
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
            <CardTitle className="text-xl" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              All Affiliates
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {affiliates === undefined ? (
              <div className="text-center py-8" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                Loading...
              </div>
            ) : affiliates.length === 0 ? (
              <div className="text-center py-8 text-gray-500" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                No affiliates found
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 lg:mx-0">
                <div className="inline-block min-w-full align-middle px-4 lg:px-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2">
                        <TableHead className="text-xs lg:text-sm" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Name</TableHead>
                        <TableHead className="text-xs lg:text-sm hidden sm:table-cell" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Email</TableHead>
                        <TableHead className="text-xs lg:text-sm hidden md:table-cell" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Phone</TableHead>
                        <TableHead className="text-xs lg:text-sm hidden lg:table-cell" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Company</TableHead>
                        <TableHead className="text-xs lg:text-sm" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Plan</TableHead>
                        <TableHead className="text-xs lg:text-sm hidden md:table-cell" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Amount</TableHead>
                        <TableHead className="text-xs lg:text-sm" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Status</TableHead>
                        <TableHead className="text-xs lg:text-sm hidden lg:table-cell" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {affiliates.map((affiliate: Doc<"affiliates">) => (
                        <TableRow key={affiliate._id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-semibold text-xs lg:text-sm" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                            <div>
                              <div>{affiliate.name}</div>
                              <div className="text-gray-500 sm:hidden text-xs mt-1">{affiliate.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs lg:text-sm hidden sm:table-cell break-all" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                            {affiliate.email}
                          </TableCell>
                          <TableCell className="text-xs lg:text-sm hidden md:table-cell" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                            {affiliate.phone || "-"}
                          </TableCell>
                          <TableCell className="text-xs lg:text-sm hidden lg:table-cell" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                            {affiliate.company || "-"}
                          </TableCell>
                          <TableCell className="capitalize font-semibold text-xs lg:text-sm" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                            {affiliate.plan}
                          </TableCell>
                          <TableCell className="font-semibold text-xs lg:text-sm hidden md:table-cell" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                            {formatCurrency(affiliate.planPrice)}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={affiliate.status}
                              onValueChange={(value: any) =>
                                handleStatusChange(affiliate._id, value)
                              }
                            >
                              <SelectTrigger className="w-24 lg:w-32 text-xs" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-xs lg:text-sm hidden lg:table-cell" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                            {format(new Date(affiliate.createdAt), "MMM dd, yyyy")}
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

