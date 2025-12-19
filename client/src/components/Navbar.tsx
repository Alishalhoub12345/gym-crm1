import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();
  const { data: cart } = useCart();

  const cartItemCount = cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Cars", href: "/cars" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-car-front"><path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8"/><path d="M7 14h.01"/><path d="M17 14h.01"/><rect width="18" height="8" x="3" y="10" rx="2"/><path d="M5 18v2"/><path d="M19 18v2"/></svg>
          </div>
          <span className="font-display font-bold text-xl tracking-tight">AutoMarket</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full text-[10px]">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="max-w-[100px] truncate">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'admin' && (
                  <Link href="/admin">
                    <DropdownMenuItem>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                  </Link>
                )}
                <Link href="/orders">
                  <DropdownMenuItem>My Orders</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button>Login</Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t p-4 bg-background">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium p-2 rounded-md hover:bg-muted ${
                  location === link.href ? "text-primary bg-muted/50" : "text-muted-foreground"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t pt-4 mt-2 flex flex-col gap-3">
              <Link href="/cart" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-2">
                <span className="flex items-center gap-2"><ShoppingCart className="h-4 w-4"/> Cart</span>
                {cartItemCount > 0 && <Badge>{cartItemCount}</Badge>}
              </Link>
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link href="/admin" onClick={() => setIsOpen(false)} className="p-2">Admin Dashboard</Link>
                  )}
                  <Link href="/orders" onClick={() => setIsOpen(false)} className="p-2">My Orders</Link>
                  <Button variant="destructive" className="w-full" onClick={() => { logout(); setIsOpen(false); }}>Logout</Button>
                </>
              ) : (
                <Link href="/auth" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Login</Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
