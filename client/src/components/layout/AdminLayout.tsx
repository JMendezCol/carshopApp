import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { CarFront, LayoutDashboard, FileText, LogOut, Loader2 } from "lucide-react";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/api/login";
    return null;
  }

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Inventory", href: "/dashboard/vehicles", icon: CarFront },
    { label: "Policies", href: "/dashboard/policies", icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-72 border-r border-white/5 bg-card/30 md:min-h-screen flex flex-col p-6">
        <Link href="/" className="flex items-center gap-3 mb-12 group w-max">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-white/10">
            <CarFront className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-widest uppercase text-glow">Veloce Admin</span>
        </Link>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-white/10 font-semibold" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"}
              `}>
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">
              {user.firstName?.[0] || user.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.firstName || 'Admin'}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col h-screen">
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
