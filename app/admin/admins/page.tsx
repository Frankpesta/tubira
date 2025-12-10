"use client";

import { useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, Trash2, Shield } from "lucide-react";
import { useAction } from "convex/react";

export default function AdminsPage() {
  const [token] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_token");
    }
    return null;
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "b2b_agent" as "super_admin" | "financial_agent" | "b2b_agent",
  });

  const admin = useQuery(
    api.auth.verifySession,
    token ? { token } : "skip"
  );

  const currentAdmin = admin
    ? {
        id: admin.id,
        role: admin.role || "b2b_agent", // Default to b2b_agent if role is missing
      }
    : null;

  const admins = useQuery(api.adminManagement.list);
  const updateRole = useMutation(api.adminManagement.updateRole);
  const deleteAdmin = useMutation(api.adminManagement.deleteAdmin);
  const createAdmin = useAction(api.authActions.createAdmin);
  const assignDefaultRoles = useMutation(api.migrations.assignDefaultRoles);

  // Check if any admins need roles assigned
  const adminsWithoutRoles = admins?.filter((a) => !a.role).length || 0;

  const handleAssignDefaultRoles = async () => {
    if (!currentAdmin || currentAdmin.role !== "super_admin") {
      toast.error("Only super_admin can run migrations");
      return;
    }

    try {
      const result = await assignDefaultRoles();
      toast.success(`Assigned roles to ${result.updated} admin(s)`);
    } catch (error) {
      toast.error("Failed to assign default roles");
    }
  };

  // Only super_admin can access this page
  if (currentAdmin && currentAdmin.role !== "super_admin") {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                Access Denied
              </h2>
              <p className="text-gray-600" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                Only super_admin can manage admins.
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (!currentAdmin || currentAdmin.role !== "super_admin") {
      toast.error("Only super_admin can create admins");
      return;
    }

    try {
      await createAdmin({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        createdBy: currentAdmin.id,
      });

      toast.success("Admin created successfully");
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "b2b_agent",
      });
      setShowForm(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create admin"
      );
    }
  };

  const handleRoleChange = async (
    adminId: Id<"admins">,
    newRole: "super_admin" | "financial_agent" | "b2b_agent"
  ) => {
    if (!currentAdmin || currentAdmin.role !== "super_admin") {
      toast.error("Only super_admin can change roles");
      return;
    }

    try {
      await updateRole({
        adminId,
        role: newRole,
      });
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleDelete = async (adminId: Id<"admins">) => {
    if (!currentAdmin || currentAdmin.role !== "super_admin") {
      toast.error("Only super_admin can delete admins");
      return;
    }

    if (adminId === currentAdmin.id) {
      toast.error("You cannot delete your own account");
      return;
    }

    if (!confirm("Are you sure you want to delete this admin?")) {
      return;
    }

    try {
      await deleteAdmin({ adminId });
      toast.success("Admin deleted successfully");
    } catch (error) {
      toast.error("Failed to delete admin");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-700 border-red-300";
      case "financial_agent":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "b2b_agent":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
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
              Admin Management
            </h1>
            <p
              className="text-gray-600 text-base lg:text-lg"
              style={{ fontFamily: "var(--font-manrope), sans-serif" }}
            >
              Manage admin accounts and roles
            </p>
          </div>
          <div className="flex gap-2">
            {adminsWithoutRoles > 0 && (
              <Button
                onClick={handleAssignDefaultRoles}
                variant="outline"
                className="bg-yellow-50 hover:bg-yellow-100 border-yellow-300 text-yellow-700 rounded-lg shadow-lg w-full sm:w-auto"
                style={{ fontFamily: "var(--font-manrope), sans-serif" }}
              >
                Assign Roles ({adminsWithoutRoles})
              </Button>
            )}
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-lg w-full sm:w-auto"
              style={{ fontFamily: "var(--font-manrope), sans-serif" }}
            >
              <Plus className="mr-2 h-4 w-4" />
              {showForm ? "Cancel" : "Create Admin"}
            </Button>
          </div>
        </div>

        {showForm && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle
                className="text-xl"
                style={{ fontFamily: "var(--font-manrope), sans-serif" }}
              >
                Create New Admin
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
                    >
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Doe"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
                    >
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="admin@example.com"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
                    >
                      Password *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      minLength={8}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Min. 8 characters"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
                    >
                      Confirm Password *
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      minLength={8}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirm password"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label
                      htmlFor="role"
                      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
                    >
                      Role *
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="financial_agent">
                          Financial Agent
                        </SelectItem>
                        <SelectItem value="b2b_agent">B2B Agent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg"
                  style={{ fontFamily: "var(--font-manrope), sans-serif" }}
                >
                  Create Admin
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
              All Admins
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {admins === undefined ? (
              <div
                className="text-center py-8"
                style={{ fontFamily: "var(--font-manrope), sans-serif" }}
              >
                Loading...
              </div>
            ) : admins.length === 0 ? (
              <div
                className="text-center py-8 text-gray-500"
                style={{ fontFamily: "var(--font-manrope), sans-serif" }}
              >
                No admins found.
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
                          Name
                        </TableHead>
                        <TableHead
                          className="text-xs lg:text-sm"
                          style={{
                            fontFamily: "var(--font-manrope), sans-serif",
                          }}
                        >
                          Email
                        </TableHead>
                        <TableHead
                          className="text-xs lg:text-sm hidden md:table-cell"
                          style={{
                            fontFamily: "var(--font-manrope), sans-serif",
                          }}
                        >
                          Role
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
                      {admins.map((admin: Doc<"admins">) => (
                        <TableRow
                          key={admin._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell
                            className="font-semibold text-xs lg:text-sm"
                            style={{
                              fontFamily: "var(--font-manrope), sans-serif",
                            }}
                          >
                            {admin.name}
                            {admin._id === currentAdmin?.id && (
                              <span className="ml-2 text-xs text-gray-500">
                                (You)
                              </span>
                            )}
                          </TableCell>
                          <TableCell
                            className="text-xs lg:text-sm break-all"
                            style={{
                              fontFamily: "var(--font-manrope), sans-serif",
                            }}
                          >
                            {admin.email}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Select
                              value={admin.role || "b2b_agent"}
                              onValueChange={(value: any) =>
                                handleRoleChange(admin._id, value)
                              }
                              disabled={
                                admin._id === currentAdmin?.id ||
                                currentAdmin?.role !== "super_admin"
                              }
                            >
                              <SelectTrigger className="w-40 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectItem value="super_admin">
                                  Super Admin
                                </SelectItem>
                                <SelectItem value="financial_agent">
                                  Financial Agent
                                </SelectItem>
                                <SelectItem value="b2b_agent">
                                  B2B Agent
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="md:hidden mt-1">
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${getRoleBadgeColor(
                                  admin.role || "b2b_agent"
                                )}`}
                              >
                                {(admin.role || "b2b_agent").replace("_", " ").toUpperCase()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell
                            className="text-xs lg:text-sm hidden lg:table-cell"
                            style={{
                              fontFamily: "var(--font-manrope), sans-serif",
                            }}
                          >
                            {format(new Date(admin.createdAt), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            {admin._id !== currentAdmin?.id &&
                              currentAdmin?.role === "super_admin" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(admin._id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
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
