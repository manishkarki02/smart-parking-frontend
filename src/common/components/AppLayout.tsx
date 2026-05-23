import { Link, useLocation } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Car,
  MapPin,
  CalendarCheck,
  LayoutDashboard,
  Users,
  Building2,
  LogOut,
  ParkingCircle,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN"],
  },
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
    roles: ["DRIVER"],
  },
  {
    label: "Parking Map",
    to: "/parking/map",
    icon: MapPin,
    roles: ["DRIVER"],
  },
  {
    label: "My Bookings",
    to: "/bookings",
    icon: CalendarCheck,
    roles: ["DRIVER"],
  },
  {
    label: "Dashboard",
    to: "/vendor/dashboard",
    icon: LayoutDashboard,
    roles: ["VENDOR"],
  },
  {
    label: "My Parking Locations",
    to: "/vendor/parking",
    icon: ParkingCircle,
    roles: ["VENDOR"],
  },
  {
    label: "All Bookings",
    to: "/admin/bookings",
    icon: CalendarCheck,
    roles: ["ADMIN"],
  },
  {
    label: "Vendors",
    to: "/admin/vendors",
    icon: Building2,
    roles: ["ADMIN"],
  },
  {
    label: "Drivers",
    to: "/admin/drivers",
    icon: Users,
    roles: ["ADMIN"],
  },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80">
          <SidebarTrigger />
          <div className="flex min-w-0 items-center gap-2 md:hidden">
            <Car className="size-5 shrink-0 text-primary" />
            <span className="truncate text-sm font-semibold">
              Smart Parking
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function AppSidebar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const { setOpenMobile } = useSidebar();

  const filteredNavItems = user
    ? navItems.filter((item) => item.roles.includes(user.role))
    : [];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="cursor-default hover:bg-transparent hover:text-sidebar-foreground"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Car className="size-4" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold">
                  Smart Parking
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60">
                  {user?.role
                    ? `${user.role.toLowerCase()} panel`
                    : "Parking panel"}
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.to;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Link to={item.to} onClick={() => setOpenMobile(false)}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={user?.name || "Account"}
              className="cursor-default hover:bg-transparent hover:text-sidebar-foreground"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
                {user?.name?.slice(0, 1).toUpperCase() || "U"}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">
                  {user?.name}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60">
                  {user?.email}
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Logout" onClick={handleLogout}>
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
