import { useState, useMemo } from "react";
import { useParams, Link } from "wouter";
import { useVehicle } from "@/hooks/use-vehicles";
import { usePolicies } from "@/hooks/use-policies";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Loader2, ArrowLeft, Calendar, Gauge, ShieldCheck, Tag, Check, ExternalLink, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FALLBACK_CAR = "https://images.unsplash.com/photo-1503376710349-5a1e2632b8fa?w=1200&q=80";

export default function VehicleDetail() {
  const { id } = useParams();
  const { data: vehicle, isLoading: vehicleLoading } = useVehicle(Number(id));
  const { data: policies, isLoading: policiesLoading } = usePolicies();

  const [loanTerm, setLoanTerm] = useState(48);
  const [downPayment, setDownPayment] = useState(0);

  const monthlyPayment = useMemo(() => {
    if (!vehicle) return 0;
    const principal = vehicle.price - downPayment;
    const monthlyRate = 0.015; // 1.5% monthly approx
    if (principal <= 0) return 0;
    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm));
  }, [vehicle, downPayment, loanTerm]);

  if (vehicleLoading) {
    return (
      <PublicLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary opacity-50" />
        </div>
      </PublicLayout>
    );
  }

  if (!vehicle) {
    return (
      <PublicLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl font-display font-bold mb-4">Vehículo No Encontrado</h1>
          <p className="text-muted-foreground mb-8">Este vehículo puede haber sido vendido o removido.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-secondary rounded-full hover:bg-secondary/80 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al Inventario
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Volver al Inventario
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="space-y-6 animate-in slide-in-from-left-8 fade-in duration-700">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden glass-panel">
              <img 
                src={vehicle.imageUrl || FALLBACK_CAR} 
                alt={vehicle.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_CAR; }}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <Calendar className="w-6 h-6 text-primary mb-2 opacity-80" />
                <span className="text-sm text-muted-foreground mb-1">Año</span>
                <span className="font-bold text-lg">{vehicle.year}</span>
              </div>
              <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <Gauge className="w-6 h-6 text-primary mb-2 opacity-80" />
                <span className="text-sm text-muted-foreground mb-1">Kilometraje</span>
                <span className="font-bold text-lg">{vehicle.mileage.toLocaleString()} km</span>
              </div>
              <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <Tag className="w-6 h-6 text-primary mb-2 opacity-80" />
                <span className="text-sm text-muted-foreground mb-1">Estado</span>
                <span className="font-bold text-lg capitalize">{vehicle.condition === 'new' ? 'Nuevo' : 'Usado'}</span>
              </div>
            </div>

            <Card className="bg-white/5 border-white/10 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-display flex items-center gap-2 text-primary">
                  <Tag className="w-5 h-5" /> Simulador de Crédito
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Cuota Inicial: {formatCurrency(downPayment)}</label>
                  <Input 
                    type="range" 
                    min={0} 
                    max={vehicle.price * 0.9} 
                    step={1000000}
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Plazo (meses)</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                  >
                    {[12, 24, 36, 48, 60, 72].map(m => <option key={m} value={m} className="bg-[#111]">{m} meses</option>)}
                  </select>
                </div>
                <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                  <span className="text-muted-foreground">Cuota mensual aprox:</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(monthlyPayment)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="animate-in slide-in-from-right-8 fade-in duration-700 flex flex-col">
            <div className="mb-2 flex gap-2">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-widest uppercase text-white/80">
                {vehicle.brand}
              </span>
              {vehicle.location && (
                <span className="px-3 py-1 bg-primary/20 rounded-full text-xs font-bold tracking-widest uppercase text-primary">
                  {vehicle.location}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mt-4 mb-4">{vehicle.title}</h1>
            <p className="text-3xl font-display text-white mb-8">{formatCurrency(vehicle.price)}</p>

            <div className="prose prose-invert max-w-none mb-8">
              <p className="text-lg text-white/70 leading-relaxed">{vehicle.description}</p>
            </div>

            {vehicle.features && vehicle.features.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" /> Características
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vehicle.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/80">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-auto space-y-4 pt-8 border-t border-white/10">
              {vehicle.status === "available" ? (
                <>
                  <Button 
                    asChild
                    className="w-full py-7 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-2xl font-bold text-xl shadow-xl hover:-translate-y-1 transition-all"
                  >
                    <a 
                      href={`https://wa.me/${vehicle.whatsappNumber || '573000000000'}?text=Hola,%20estoy%20interesado%20en%20el%20vehículo:%20${encodeURIComponent(vehicle.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="w-6 h-6 mr-2" /> Contactar por WhatsApp
                    </a>
                  </Button>
                  {vehicle.paymentLink && (
                    <Button 
                      asChild
                      variant="outline"
                      className="w-full py-7 rounded-2xl font-bold text-xl border-white/10 hover:bg-white/5 transition-all"
                    >
                      <a href={vehicle.paymentLink} target="_blank" rel="noopener noreferrer">
                        Reservar con $1.000.000 <ExternalLink className="ml-2 w-5 h-5" />
                      </a>
                    </Button>
                  )}
                </>
              ) : (
                <div className="w-full py-5 bg-red-500/20 text-red-200 border border-red-500/30 rounded-2xl font-bold text-lg text-center uppercase tracking-widest">
                  Vendido
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Policies Section */}
        {!policiesLoading && policies && policies.length > 0 && (
          <div className="mt-24 pt-12 border-t border-white/5">
            <h2 className="text-3xl font-display font-bold mb-8 text-center">Políticas y Garantías</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {policies.map(policy => (
                <div key={policy.id} className="glass-panel p-6 rounded-2xl">
                  <h4 className="text-lg font-bold mb-3 text-primary">{policy.title}</h4>
                  <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{policy.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
