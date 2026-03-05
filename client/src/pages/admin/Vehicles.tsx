import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from "@/hooks/use-vehicles";
import { Plus, Edit2, Trash2, X, ExternalLink, Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Vehicle } from "@shared/routes";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  mileage: z.coerce.number().min(0),
  condition: z.enum(["new", "used"]),
  features: z.string().optional(),
  imageUrl: z.string().url("Must be valid URL").optional().or(z.literal("")),
  paymentLink: z.string().url("Must be valid URL").optional().or(z.literal("")),
  status: z.enum(["available", "sold"]).optional().default("available"),
});

type FormData = z.infer<typeof formSchema>;

export default function Vehicles() {
  const { data: vehicles, isLoading } = useVehicles();
  const deleteMutation = useDeleteVehicle();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const openNew = () => {
    setEditingVehicle(null);
    setModalOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Inventory Management</h1>
          <p className="text-muted-foreground">Add, edit, or remove vehicles from your showroom.</p>
        </div>
        <button 
          onClick={openNew}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <Plus className="w-5 h-5" /> Add Vehicle
        </button>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-5 font-medium text-muted-foreground">Vehicle details</th>
                <th className="p-5 font-medium text-muted-foreground">Price</th>
                <th className="p-5 font-medium text-muted-foreground">Status</th>
                <th className="p-5 font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground"><Loader2 className="w-8 h-8 animate-spin mx-auto"/></td></tr>
              ) : !vehicles || vehicles.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No inventory yet. Add a vehicle to get started.</td></tr>
              ) : (
                vehicles.map(v => (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg bg-secondary overflow-hidden shrink-0">
                          {v.imageUrl ? <img src={v.imageUrl} alt={v.title} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No img</div>}
                        </div>
                        <div>
                          <div className="font-bold text-lg line-clamp-1">{v.title}</div>
                          <div className="text-sm text-muted-foreground">{v.year} • {v.mileage.toLocaleString()} mi • {v.condition}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 font-bold">{formatCurrency(v.price)}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                        v.status === 'available' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(v)} className="p-2 rounded-lg bg-secondary text-white hover:bg-white/20 transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(v.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <VehicleModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        vehicle={editingVehicle} 
      />
    </AdminLayout>
  );
}

function VehicleModal({ isOpen, onClose, vehicle }: { isOpen: boolean, onClose: () => void, vehicle: Vehicle | null }) {
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: vehicle ? {
      ...vehicle,
      features: vehicle.features ? vehicle.features.join(", ") : "",
    } : { condition: "new", status: "available" }
  });

  // Reset form when vehicle changes
  import("react").then(React => {
    React.useEffect(() => {
      if (isOpen) {
        reset(vehicle ? {
          ...vehicle,
          features: vehicle.features ? vehicle.features.join(", ") : "",
        } : { title: "", description: "", price: 0, brand: "", model: "", year: new Date().getFullYear(), mileage: 0, condition: "new", features: "", imageUrl: "", paymentLink: "", status: "available" });
      }
    }, [isOpen, vehicle, reset]);
  });

  const onSubmit = (data: FormData) => {
    const payload = {
      ...data,
      features: data.features ? data.features.split(",").map(s => s.trim()).filter(Boolean) : [],
    };

    if (vehicle) {
      updateMutation.mutate({ id: vehicle.id, ...payload }, {
        onSuccess: () => { onClose(); }
      });
    } else {
      // Create schema expects omit status
      const { status, ...createPayload } = payload;
      createMutation.mutate(createPayload, {
        onSuccess: () => { onClose(); }
      });
    }
  };

  if (!isOpen) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-white/10 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <h2 className="text-2xl font-display font-bold">{vehicle ? "Edit Vehicle" : "Add New Vehicle"}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form id="vehicle-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                <input {...register("title")} className="w-full px-4 py-3 bg-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-white/20" placeholder="e.g. 2023 Porsche 911" />
                {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Brand</label>
                <input {...register("brand")} className="w-full px-4 py-3 bg-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-white/20" placeholder="e.g. Porsche" />
                {errors.brand && <p className="text-red-400 text-xs">{errors.brand.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Model</label>
                <input {...register("model")} className="w-full px-4 py-3 bg-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-white/20" placeholder="e.g. 911 Carrera S" />
                {errors.model && <p className="text-red-400 text-xs">{errors.model.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Year</label>
                  <input type="number" {...register("year")} className="w-full px-4 py-3 bg-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-white/20" />
                  {errors.year && <p className="text-red-400 text-xs">{errors.year.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Price ($)</label>
                  <input type="number" {...register("price")} className="w-full px-4 py-3 bg-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-white/20" />
                  {errors.price && <p className="text-red-400 text-xs">{errors.price.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Mileage</label>
                  <input type="number" {...register("mileage")} className="w-full px-4 py-3 bg-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-white/20" />
                  {errors.mileage && <p className="text-red-400 text-xs">{errors.mileage.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Condition</label>
                  <select {...register("condition")} className="w-full px-4 py-3 bg-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-white/20 appearance-none">
                    <option value="new">New</option>
                    <option value="used">Used</option>
                  </select>
                </div>
              </div>

              {vehicle && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <select {...register("status")} className="w-full px-4 py-3 bg-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-white/20 appearance-none">
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <textarea {...register("description")} rows={4} className="w-full px-4 py-3 bg-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-white/20 resize-none" placeholder="Detailed vehicle description..." />
              {errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Features (comma separated)</label>
              <input {...register("features")} className="w-full px-4 py-3 bg-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-white/20" placeholder="Leather Seats, Navigation, Sunroof" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Image URL</label>
              <input {...register("imageUrl")} className="w-full px-4 py-3 bg-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-white/20" placeholder="https://..." />
              {errors.imageUrl && <p className="text-red-400 text-xs">{errors.imageUrl.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Payment Link (Stripe/External)</label>
              <input {...register("paymentLink")} className="w-full px-4 py-3 bg-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-white/20" placeholder="https://buy.stripe.com/..." />
              {errors.paymentLink && <p className="text-red-400 text-xs">{errors.paymentLink.message}</p>}
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-white/5 shrink-0 flex justify-end gap-3 bg-card/50">
          <button onClick={onClose} disabled={isPending} className="px-6 py-3 rounded-xl font-bold bg-transparent text-white hover:bg-white/10 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" form="vehicle-form" disabled={isPending} className="px-8 py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {isPending ? "Saving..." : "Save Vehicle"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
