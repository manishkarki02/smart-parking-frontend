import { useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Car,
  MapPin,
  CalendarCheck,
  CalendarClock,
  CreditCard,
  LayoutDashboard,
  Users,
  LogOut,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  PageHeaderContext,
  type PageHeaderState,
} from "@/common/components/page-header-context";
import { cn } from "@/lib/utils";

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
    label: "Parkings",
    to: "/parkings/map",
    icon: MapPin,
    roles: ["DRIVER"],
  },
  {
    label: "Bookings",
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
    label: "My Locations",
    to: "/vendor/parkings",
    icon: MapPin,
    roles: ["VENDOR"],
  },
  {
    label: "Bookings",
    to: "/vendor/bookings",
    icon: CalendarClock,
    roles: ["VENDOR"],
  },
  {
    label: "Revenue",
    to: "/vendor/earnings",
    icon: Wallet,
    roles: ["VENDOR"],
  },
  {
    label: "Bookings",
    to: "/admin/bookings",
    icon: CalendarCheck,
    roles: ["ADMIN"],
  },
  {
    label: "Users",
    to: "/admin/users",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    label: "Payments",
    to: "/admin/payments",
    icon: CreditCard,
    roles: ["ADMIN"],
  },
];

export function AppLayout({
  children,
  showHeader = true,
  mainClassName,
}: {
  children: ReactNode;
  showHeader?: boolean;
  mainClassName?: string;
}) {
  const [pageHeader, setPageHeader] = useState<PageHeaderState | null>(null);

  const pageHeaderValue = useMemo(
    () => ({ pageHeader, setPageHeader }),
    [pageHeader],
  );

  return (
    <SidebarProvider>
      <PageHeaderContext.Provider value={pageHeaderValue}>
        <AppSidebar />

        <SidebarInset className="min-w-0 overflow-x-hidden">
          {showHeader ? (
            <header className="sticky top-0 z-30 flex min-h-16 shrink-0 items-center border-b bg-white px-4 backdrop-blur supports-backdrop-filter:bg-white/90 md:px-6">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex min-w-0 items-center gap-2 md:hidden">
                  <Car className="size-5 shrink-0 text-primary" />
                  <span className="truncate text-sm font-semibold">
                    Smart
                    <span className="text-blue-500">Parking</span>
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <div className="min-w-0 py-2">
                    {pageHeader?.content ? (
                      pageHeader.content
                    ) : pageHeader ? (
                      <p className="truncate text-lg font-semibold tracking-tight text-foreground">
                        {pageHeader.title}
                      </p>
                    ) : (
                      <p className="truncate text-lg font-semibold tracking-tight text-foreground">
                        Overview
                      </p>
                    )}
                  </div>

                  {pageHeader?.action ? (
                    <div className="flex shrink-0 items-center">
                      {pageHeader.action}
                    </div>
                  ) : null}
                </div>
              </div>
            </header>
          ) : null}

          <main
            className={cn(
              "min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6",
              mainClassName,
            )}
          >
            {children}
          </main>
        </SidebarInset>
      </PageHeaderContext.Provider>
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
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.to;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={`${item.label}-${item.to}`}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                        isActive &&
                          "bg-blue-50 text-blue-600 hover:bg-blue-50 hover:text-blue-600",
                      )}
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
