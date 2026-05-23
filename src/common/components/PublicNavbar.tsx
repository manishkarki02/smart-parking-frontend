import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Car className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold bg-linear-to-r from-primary to-green-500 bg-clip-text text-transparent">
            Smart Parking
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Home
            </Link>
          </Button>

          <Button variant="ghost" asChild>
            <Link to="/login">Sign In</Link>
          </Button>

          <Button asChild>
            <Link to="/register">Sign Up</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
