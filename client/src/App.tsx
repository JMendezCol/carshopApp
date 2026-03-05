import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Home from "@/pages/public/Home";
import VehicleDetail from "@/pages/public/VehicleDetail";
import Dashboard from "@/pages/admin/Dashboard";
import Vehicles from "@/pages/admin/Vehicles";
import Policies from "@/pages/admin/Policies";
import NotFound from "@/pages/not-found";

function Router() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/v/:id" component={VehicleDetail} />
      
      {/* Admin Routes */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/vehicles" component={Vehicles} />
      <Route path="/dashboard/policies" component={Policies} />
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
