import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">
            Smart 
            <span className="text-blue-500">Parking</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-3">
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
