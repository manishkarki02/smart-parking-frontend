import { Link, useLocation } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Car,
  MapPin,
  CalendarCheck,
  LayoutDashboard,
  Users,
  Building2,
  LogOut,
  ParkingCircle,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    roles: ["ADMIN"],
  },
  {
    label: "Find Parking",
    to: "/parking",
    icon: <MapPin className="h-4 w-4" />,
    roles: ["DRIVER"],
  },
  {
    label: "My Bookings",
    to: "/bookings",
    icon: <CalendarCheck className="h-4 w-4" />,
    roles: ["DRIVER"],
  },
  {
    label: "My Parking Locations",
    to: "/vendor/parking",
    icon: <ParkingCircle className="h-4 w-4" />,
    roles: ["VENDOR"],
  },
  {
    label: "All Bookings",
    to: "/admin/bookings",
    icon: <CalendarCheck className="h-4 w-4" />,
    roles: ["ADMIN"],
  },
  {
    label: "Vendors",
    to: "/admin/vendors",
    icon: <Building2 className="h-4 w-4" />,
    roles: ["ADMIN"],
  },
  {
    label: "Drivers",
    to: "/admin/drivers",
    icon: <Users className="h-4 w-4" />,
    roles: ["ADMIN"],
  },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNavItems = user 
    ? navItems.filter((item) => item.roles.includes(user.role))
    : [];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-6">
          <Car className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Smart Parking</span>
        </div>

        <Separator />

        {/* Nav links */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Separator />

        {/* User info + logout */}
        <div className="p-4">
          <div className="mb-2">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role?.toLowerCase()}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-16 items-center border-b border-border bg-card px-4 lg:hidden shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
          <div className="ml-3 flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">Smart Parking</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
