import { AdminLayout } from "@/components/layout/AdminLayout";
import { useVehicles } from "@/hooks/use-vehicles";
import { usePolicies } from "@/hooks/use-policies";
import { Car, DollarSign, CheckCircle, FileText } from "lucide-react";

export default function Dashboard() {
  const { data: vehicles, isLoading: loadingVehicles } = useVehicles();
  const { data: policies, isLoading: loadingPolicies } = usePolicies();

  const totalVehicles = vehicles?.length || 0;
  const availableVehicles = vehicles?.filter(v => v.status === "available").length || 0;
  const soldVehicles = vehicles?.filter(v => v.status === "sold").length || 0;
  
  const inventoryValue = vehicles?.filter(v => v.status === "available").reduce((sum, v) => sum + v.price, 0) || 0;
  
  const totalPolicies = policies?.length || 0;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const StatCard = ({ title, value, icon: Icon, description }: any) => (
    <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
      <div>
        <h3 className="text-4xl font-display font-bold mb-1">{value}</h3>
        <p className="text-white/80 font-medium">{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-display font-bold mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Monitor your dealership's performance and inventory.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          title="Total Inventory" 
          value={loadingVehicles ? "-" : totalVehicles} 
          icon={Car} 
        />
        <StatCard 
          title="Available Now" 
          value={loadingVehicles ? "-" : availableVehicles} 
          icon={CheckCircle} 
          description={`${soldVehicles} vehicles sold`}
        />
        <StatCard 
          title="Inventory Value" 
          value={loadingVehicles ? "-" : formatCurrency(inventoryValue)} 
          icon={DollarSign} 
          description="Based on available stock"
        />
        <StatCard 
          title="Active Policies" 
          value={loadingPolicies ? "-" : totalPolicies} 
          icon={FileText} 
        />
      </div>

      {/* Recent Vehicles */}
      <div>
        <h2 className="text-2xl font-display font-bold mb-6">Recently Added</h2>
        <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-4 font-medium text-muted-foreground">Vehicle</th>
                  <th className="p-4 font-medium text-muted-foreground">Price</th>
                  <th className="p-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loadingVehicles ? (
                  <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : !vehicles || vehicles.length === 0 ? (
                  <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No vehicles found.</td></tr>
                ) : (
                  vehicles.slice(0, 5).map(v => (
                    <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-bold">{v.title}</div>
                        <div className="text-xs text-muted-foreground">{v.year} • {v.brand}</div>
                      </td>
                      <td className="p-4 font-medium">{formatCurrency(v.price)}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                          v.status === 'available' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
