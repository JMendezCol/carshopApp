import { PublicLayout } from "@/components/layout/PublicLayout";
import { useVehicles } from "@/hooks/use-vehicles";
import { Link } from "wouter";
import { ArrowRight, Loader2, Calendar, Gauge } from "lucide-react";

{/* landing page hero luxury sports car front view dark moody lighting */}
const HERO_BG = "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=1920&q=80";
const FALLBACK_CAR = "https://images.unsplash.com/photo-1503376710349-5a1e2632b8fa?w=800&q=80";

export default function Home() {
  const { data: vehicles, isLoading } = useVehicles();
  
  const availableVehicles = vehicles?.filter(v => v.status === "available") || [];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="Luxury Car" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 text-glow leading-tight">
            Excelencia <br className="hidden md:block"/>Sin Compromisos
          </h1>
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto font-light">
            Descubre una colección curada de vehículos premium en Colombia diseñados para elevar tu camino. 
            Cada modelo representa la cúspide de la ingeniería automotriz.
          </p>
          <a href="#inventory" className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            Explorar Inventario <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Inventory Section */}
      <div id="inventory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">Inventario Destacado</h2>
            <p className="text-muted-foreground text-lg">Vehículos seleccionados actualmente disponibles</p>
          </div>
          <div className="text-sm px-4 py-2 rounded-full bg-secondary text-secondary-foreground">
            {availableVehicles.length} Vehículos Disponibles
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary opacity-50" />
          </div>
        ) : availableVehicles.length === 0 ? (
          <div className="text-center py-32 glass-panel rounded-3xl">
            <h3 className="text-2xl font-display text-muted-foreground">No hay vehículos disponibles actualmente.</h3>
            <p className="mt-2 text-white/40">Vuelve pronto, actualizamos nuestro inventario frecuentemente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availableVehicles.map(vehicle => (
              <Link key={vehicle.id} href={`/v/${vehicle.id}`} className="group relative rounded-2xl overflow-hidden glass-panel border border-white/10 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                <div className="aspect-[4/3] overflow-hidden bg-secondary/50">
                  <img 
                    src={vehicle.imageUrl || FALLBACK_CAR} 
                    alt={vehicle.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_CAR; }}
                  />
                  <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-white/10">
                    {vehicle.condition === 'new' ? 'Nuevo' : 'Usado'}
                  </div>
                </div>
                
                <div className="p-6 relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-primary mb-1 font-bold tracking-widest uppercase">{vehicle.brand}</p>
                      <h3 className="text-xl font-bold font-display group-hover:text-primary transition-colors line-clamp-1">{vehicle.title}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/>{vehicle.year}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20"/>
                    <span className="flex items-center gap-1.5"><Gauge className="w-4 h-4"/>{vehicle.mileage.toLocaleString()} km</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-2xl font-display font-bold text-white">{formatCurrency(vehicle.price)}</span>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
