"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Activity, 
  LogOut,
  X,
  Tag,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const allMenuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["super_admin", "financial_agent", "b2b_agent"],
  },
  {
    title: "Affiliates",
    href: "/admin/affiliates",
    icon: Users,
    roles: ["super_admin", "b2b_agent"],
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: DollarSign,
    roles: ["super_admin", "financial_agent"],
  },
  {
    title: "Activities",
    href: "/admin/activities",
    icon: Activity,
    roles: ["super_admin", "financial_agent", "b2b_agent"],
  },
  {
    title: "Coupons",
    href: "/admin/coupons",
    icon: Tag,
    roles: ["super_admin"],
  },
  {
    title: "Admins",
    href: "/admin/admins",
    icon: Shield,
    roles: ["super_admin"],
  },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  adminRole?: string;
}

export function AdminSidebar({ isOpen = true, onClose, adminRole }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Filter menu items based on role (default to b2b_agent if role is missing)
  const effectiveRole = adminRole || "b2b_agent";
  const menuItems = allMenuItems.filter((item) => item.roles.includes(effectiveRole));

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_data");
    // Clear cookie
    document.cookie = "admin_token=; path=/; max-age=0";
    router.push("/admin/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r bg-gradient-to-b from-gray-50 to-white shadow-lg transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b bg-gradient-to-r from-blue-600 to-purple-600 px-6">
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
            Tubira Admin
          </h1>
          <button
            onClick={onClose}
            className="lg:hidden text-white hover:text-gray-200 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => {
                  // Close mobile sidebar when navigating
                  if (onClose) {
                    onClose();
                  }
                }}
              >
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-all mb-2",
                    isActive 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md" 
                      : "hover:bg-gray-100"
                  )}
                  style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4 bg-gray-50/50">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
            onClick={handleLogout}
            style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}

