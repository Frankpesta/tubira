"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

export default function CouponsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: "",
    maxUsage: "",
    expiresAt: "",
  });

  // Get admin info for creating coupons
  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    setToken(adminToken);
  }, []);

  const admin = useQuery(
    api.auth.verifySession,
    token ? { token } : "skip"
  );

  const coupons = useQuery(api.coupons.list);
  const createCoupon = useMutation(api.coupons.create);
  const toggleActive = useMutation(api.coupons.toggleActive);
  const deleteCoupon = useMutation(api.coupons.deleteCoupon);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }

    const discount = parseFloat(formData.discountPercentage);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      toast.error("Discount percentage must be between 0 and 100");
      return;
    }

    if (!admin) {
      toast.error("Admin session not found");
      return;
    }

    try {
      await createCoupon({
        code: formData.code.trim(),
        discountPercentage: discount,
        maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : undefined,
        expiresAt: formData.expiresAt
          ? new Date(formData.expiresAt).getTime()
          : undefined,
        createdBy: admin.id as Id<"admins">,
      });

      toast.success("Coupon created successfully");
      setFormData({
        code: "",
        discountPercentage: "",
        maxUsage: "",
        expiresAt: "",
      });
      setShowForm(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create coupon"
      );
    }
  };

  const handleToggleActive = async (
    couponId: Id<"coupons">,
    currentStatus: boolean
  ) => {
    try {
      await toggleActive({
        couponId,
        isActive: !currentStatus,
      });
      toast.success(
        `Coupon ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      toast.error("Failed to update coupon status");
    }
  };

  const handleDelete = async (couponId: Id<"coupons">) => {
    if (!confirm("Are you sure you want to delete this coupon?")) {
      return;
    }

    try {
      await deleteCoupon({ couponId });
      toast.success("Coupon deleted successfully");
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1
              className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: "var(--font-manrope), sans-serif" }}
            >
              Coupons
            </h1>
            <p
              className="text-gray-600 text-base lg:text-lg"
              style={{ fontFamily: "var(--font-manrope), sans-serif" }}
            >
              Generate and manage discount coupon codes
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-lg w-full sm:w-auto"
            style={{ fontFamily: "var(--font-manrope), sans-serif" }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {showForm ? "Cancel" : "Create Coupon"}
          </Button>
        </div>

        {showForm && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle
                className="text-xl"
                style={{ fontFamily: "var(--font-manrope), sans-serif" }}
              >
                Create New Coupon
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="code"
                      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
                    >
                      Coupon Code *
                    </Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="SAVE20"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="discountPercentage"
                      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
                    >
                      Discount Percentage *
                    </Label>
                    <Input
                      id="discountPercentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.discountPercentage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountPercentage: e.target.value,
                        })
                      }
                      placeholder="20"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="maxUsage"
                      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
                    >
                      Max Usage (Optional)
                    </Label>
                    <Input
                      id="maxUsage"
                      type="number"
                      min="1"
                      value={formData.maxUsage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxUsage: e.target.value,
                        })
                      }
                      placeholder="100"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="expiresAt"
                      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
                    >
                      Expiration Date (Optional)
                    </Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expiresAt: e.target.value,
                        })
                      }
                      className="h-12"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg"
                  style={{ fontFamily: "var(--font-manrope), sans-serif" }}
                >
                  Create Coupon
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle
              className="text-xl"
              style={{ fontFamily: "var(--font-manrope), sans-serif" }}
            >
              All Coupons
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {coupons === undefined ? (
              <div
                className="text-center py-8"
                style={{ fontFamily: "var(--font-manrope), sans-serif" }}
              >
                Loading...
              </div>
            ) : coupons.length === 0 ? (
              <div
                className="text-center py-8 text-gray-500"
                style={{ fontFamily: "var(--font-manrope), sans-serif" }}
              >
                No coupons found. Create your first coupon above.
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 lg:mx-0">
                <div className="inline-block min-w-full align-middle px-4 lg:px-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2">
                        <TableHead
                          className="text-xs lg:text-sm"
                          style={{
                            fontFamily: "var(--font-manrope), sans-serif",
                          }}
                        >
                          Code
                        </TableHead>
                        <TableHead
                          className="text-xs lg:text-sm"
                          style={{
                            fontFamily: "var(--font-manrope), sans-serif",
                          }}
                        >
                          Discount
                        </TableHead>
                        <TableHead
                          className="text-xs lg:text-sm hidden md:table-cell"
                          style={{
                            fontFamily: "var(--font-manrope), sans-serif",
                          }}
                        >
                          Usage
                        </TableHead>
                        <TableHead
                          className="text-xs lg:text-sm hidden lg:table-cell"
                          style={{
                            fontFamily: "var(--font-manrope), sans-serif",
                          }}
                        >
                          Expires
                        </TableHead>
                        <TableHead
                          className="text-xs lg:text-sm"
                          style={{
                            fontFamily: "var(--font-manrope), sans-serif",
                          }}
                        >
                          Status
                        </TableHead>
                        <TableHead
                          className="text-xs lg:text-sm hidden lg:table-cell"
                          style={{
                            fontFamily: "var(--font-manrope), sans-serif",
                          }}
                        >
                          Created
                        </TableHead>
                        <TableHead
                          className="text-xs lg:text-sm"
                          style={{
                            fontFamily: "var(--font-manrope), sans-serif",
                          }}
                        >
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coupons.map((coupon: Doc<"coupons">) => {
                        const isExpired =
                          coupon.expiresAt && coupon.expiresAt < Date.now();
                        const isMaxUsageReached =
                          coupon.maxUsage &&
                          coupon.usageCount >= coupon.maxUsage;
                        const isActive =
                          coupon.isActive && !isExpired && !isMaxUsageReached;

                        return (
                          <TableRow
                            key={coupon._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <TableCell
                              className="font-semibold text-xs lg:text-sm font-mono"
                              style={{
                                fontFamily: "var(--font-manrope), sans-serif",
                              }}
                            >
                              {coupon.code}
                            </TableCell>
                            <TableCell
                              className="text-xs lg:text-sm font-semibold text-green-600"
                              style={{
                                fontFamily: "var(--font-manrope), sans-serif",
                              }}
                            >
                              {coupon.discountPercentage}%
                            </TableCell>
                            <TableCell
                              className="text-xs lg:text-sm hidden md:table-cell"
                              style={{
                                fontFamily: "var(--font-manrope), sans-serif",
                              }}
                            >
                              {coupon.usageCount}
                              {coupon.maxUsage
                                ? ` / ${coupon.maxUsage}`
                                : " / ∞"}
                            </TableCell>
                            <TableCell
                              className="text-xs lg:text-sm hidden lg:table-cell"
                              style={{
                                fontFamily: "var(--font-manrope), sans-serif",
                              }}
                            >
                              {coupon.expiresAt
                                ? format(
                                    new Date(coupon.expiresAt),
                                    "MMM dd, yyyy"
                                  )
                                : "Never"}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleToggleActive(
                                    coupon._id,
                                    coupon.isActive
                                  )
                                }
                                className="flex items-center gap-2"
                              >
                                {isActive ? (
                                  <>
                                    <ToggleRight className="h-4 w-4 text-green-600" />
                                    <span className="text-green-600 text-xs">
                                      Active
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <ToggleLeft className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-400 text-xs">
                                      Inactive
                                    </span>
                                  </>
                                )}
                              </Button>
                            </TableCell>
                            <TableCell
                              className="text-xs lg:text-sm hidden lg:table-cell"
                              style={{
                                fontFamily: "var(--font-manrope), sans-serif",
                              }}
                            >
                              {format(
                                new Date(coupon.createdAt),
                                "MMM dd, yyyy"
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(coupon._id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
