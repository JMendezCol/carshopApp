import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { usePolicies, useCreatePolicy, useUpdatePolicy, useDeletePolicy } from "@/hooks/use-policies";
import { Plus, Edit2, Trash2, X, Loader2, FileText } from "lucide-react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CompanyPolicy } from "@shared/routes";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function Policies() {
  const { data: policies, isLoading } = usePolicies();
  const deleteMutation = useDeletePolicy();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<CompanyPolicy | null>(null);

  const openNew = () => {
    setEditingPolicy(null);
    setModalOpen(true);
  };

  const openEdit = (p: CompanyPolicy) => {
    setEditingPolicy(p);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this policy?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Company Policies</h1>
          <p className="text-muted-foreground">Manage rules, return policies, and terms displayed to customers.</p>
        </div>
        <button 
          onClick={openNew}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <Plus className="w-5 h-5" /> Add Policy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
          </div>
        ) : !policies || policies.length === 0 ? (
          <div className="col-span-full py-20 text-center glass-panel rounded-3xl">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg">No policies created yet.</p>
          </div>
        ) : (
          policies.map(policy => (
            <div key={policy.id} className="glass-panel p-6 rounded-3xl relative group border border-white/5 hover:border-white/20 transition-colors">
              <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(policy)} className="p-2 rounded-lg bg-secondary text-white hover:bg-white/20 transition-colors" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(policy.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-xl font-bold mb-3 pr-20">{policy.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap line-clamp-4">{policy.content}</p>
            </div>
          ))
        )}
      </div>

      <PolicyModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        policy={editingPolicy} 
      />
    </AdminLayout>
  );
}

function PolicyModal({ isOpen, onClose, policy }: { isOpen: boolean, onClose: () => void, policy: CompanyPolicy | null }) {
  const createMutation = useCreatePolicy();
  const updateMutation = useUpdatePolicy();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: policy || { title: "", content: "" }
  });

  import("react").then(React => {
    React.useEffect(() => {
      if (isOpen) {
        reset(policy || { title: "", content: "" });
      }
    }, [isOpen, policy, reset]);
  });

  const onSubmit = (data: FormData) => {
    if (policy) {
      updateMutation.mutate({ id: policy.id, ...data }, { onSuccess: onClose });
    } else {
      createMutation.mutate(data, { onSuccess: onClose });
    }
  };

  if (!isOpen) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <h2 className="text-2xl font-display font-bold">{policy ? "Edit Policy" : "Add Policy"}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="policy-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Policy Title</label>
              <input {...register("title")} className="w-full px-4 py-3 bg-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-white/20" placeholder="e.g. Return Policy" />
              {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Content</label>
              <textarea {...register("content")} rows={8} className="w-full px-4 py-3 bg-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-transparent focus:border-white/20 resize-none" placeholder="Detailed terms and conditions..." />
              {errors.content && <p className="text-red-400 text-xs">{errors.content.message}</p>}
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-white/5 shrink-0 flex justify-end gap-3 bg-card/50 rounded-b-3xl">
          <button onClick={onClose} disabled={isPending} className="px-6 py-3 rounded-xl font-bold bg-transparent text-white hover:bg-white/10 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" form="policy-form" disabled={isPending} className="px-8 py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {isPending ? "Saving..." : "Save Policy"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
