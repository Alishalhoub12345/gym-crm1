import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard, Users, Building2, Dumbbell, UserCheck,
  Package, CreditCard, ClipboardCheck, TrendingUp, ShoppingBag,
  Salad, MessageSquare, LogOut, ChevronRight, Activity
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: any;
  roles: string[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["owner", "admin", "coach", "member", "dietitian"] },
  { label: "Branches", path: "/branches", icon: Building2, roles: ["owner"] },
  { label: "Members", path: "/members", icon: Users, roles: ["owner", "admin", "coach"] },
  { label: "Coaches", path: "/coaches", icon: UserCheck, roles: ["owner", "admin"] },
  { label: "Classes", path: "/classes", icon: Dumbbell, roles: ["owner", "admin", "coach", "member"] },
  { label: "Packages", path: "/packages", icon: Package, roles: ["owner", "admin"] },
  { label: "Payments", path: "/payments", icon: CreditCard, roles: ["owner", "admin"] },
  { label: "Attendance", path: "/attendance", icon: ClipboardCheck, roles: ["owner", "admin", "coach"] },
  { label: "CRM Leads", path: "/leads", icon: TrendingUp, roles: ["owner", "admin"] },
  { label: "Diet Plans", path: "/diet-plans", icon: Salad, roles: ["owner", "admin", "dietitian"] },
  { label: "Products", path: "/products", icon: ShoppingBag, roles: ["owner", "admin"] },
  { label: "Messages", path: "/messages", icon: MessageSquare, roles: ["owner", "admin"] },
  { label: "Users", path: "/users", icon: Users, roles: ["owner", "admin"] },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const filtered = navItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-30" style={{ background: "hsl(224, 71%, 4%)" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-lg">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-base leading-tight">GymCRM</div>
          <div className="text-white/40 text-xs capitalize">{user.role}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {filtered.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path || location.startsWith(item.path + "/");
          return (
            <Link key={item.path} href={item.path}>
              <div
                data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
                className={`sidebar-item ${isActive ? "active" : "text-white/60"}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User profile & logout */}
      <div className="px-3 pb-4 pt-2 border-t border-white/10">
        <div className="px-3 py-2 mb-1">
          <div className="text-white text-sm font-medium truncate">{user.name}</div>
          <div className="text-white/40 text-xs truncate">{user.email}</div>
        </div>
        <button
          onClick={logout}
          data-testid="button-logout"
          className="sidebar-item text-white/60 w-full hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
