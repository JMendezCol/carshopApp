import { ReactNode } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { CarFront, Shield, LogIn, LayoutDashboard } from "lucide-react";
import { Chatbot } from "../Chatbot";

export function PublicLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <CarFront className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold tracking-widest uppercase">Veloce</span>
          </Link>
          
          <div className="flex items-center gap-6">
            {!isLoading && (
              user ? (
                <Link href="/dashboard" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors text-sm">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              ) : (
                <a href="/api/login" className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all text-sm shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                  <LogIn className="w-4 h-4" />
                  Admin Login
                </a>
              )
            )}
          </div>
        </div>
      </nav>
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-white/5 bg-card/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <CarFront className="w-5 h-5" />
            <span className="font-display font-bold tracking-widest uppercase">Veloce</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Transacciones Seguras</span>
            <span>© {new Date().getFullYear()} Veloce Motors Colombia.</span>
          </div>
        </div>
      </footer>
      <Chatbot />
    </div>
  );
}
