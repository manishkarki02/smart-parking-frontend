import { Link, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Car, User, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { LoginModal } from "@/features/auth/components/LoginModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DriverHeader() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2">
          <Car className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold bg-linear-to-r from-primary to-green-500 bg-clip-text text-transparent">
            Smart Parking
          </span>
        </Link>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {isAuthenticated() ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/bookings" className="cursor-pointer">
                    <Car className="mr-2 h-4 w-4" />
                    <span>My Bookings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setLoginOpen(true)}>
                Sign In
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
              <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
