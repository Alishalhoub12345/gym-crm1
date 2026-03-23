import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Edit2, Trash2, Loader2, X, CheckCircle } from "lucide-react";

const emptyForm = { name: "", description: "", price: "", durationDays: "30", branchId: "", sessionsPerWeek: "", totalClasses: "", includesGymAccess: true, includesClasses: true, status: "active" };

export default function Packages() {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const { data: packages = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/packages"] });
  const { data: branches = [] } = useQuery<any[]>({ queryKey: ["/api/branches"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/packages", data).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/packages"] }); closeModal(); toast({ title: "Package created" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => apiRequest("PUT", `/api/packages/${id}`, data).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/packages"] }); closeModal(); toast({ title: "Package updated" }); },
    onError: () => toast({ title: "Error", description: "Failed to update", variant: "destructive" }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/packages/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/packages"] }); toast({ title: "Package deleted" }); },
    onError: () => toast({ title: "Error", description: "Failed to delete", variant: "destructive" }),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || "", price: p.price, durationDays: p.durationDays, branchId: p.branchId || "", sessionsPerWeek: p.sessionsPerWeek || "", totalClasses: p.totalClasses || "", includesGymAccess: p.includesGymAccess, includesClasses: p.includesClasses, status: p.status });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(emptyForm); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, price: parseFloat(form.price), durationDays: parseInt(form.durationDays), branchId: form.branchId ? parseInt(form.branchId) : null, sessionsPerWeek: form.sessionsPerWeek ? parseInt(form.sessionsPerWeek) : null, totalClasses: form.totalClasses ? parseInt(form.totalClasses) : null };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
          <p className="text-gray-500 text-sm mt-1">Membership plans and subscriptions</p>
        </div>
        <button onClick={openCreate} data-testid="button-add-package"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Package
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(packages as any[]).length === 0 ? (
            <div className="col-span-3 text-center py-16 text-gray-400">No packages yet</div>
          ) : (packages as any[]).map((p: any) => (
            <div key={p.id} data-testid={`package-card-${p.id}`} className="bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{p.status}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{p.name}</h3>
              <div className="text-2xl font-bold text-primary mb-1">${parseFloat(p.price).toFixed(2)}</div>
              <div className="text-sm text-gray-500 mb-3">{p.durationDays} days</div>
              {p.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{p.description}</p>}
              <div className="space-y-1.5 mb-4">
                <div className={`flex items-center gap-1.5 text-xs ${p.includesGymAccess ? "text-green-600" : "text-gray-300"}`}>
                  <CheckCircle className="w-3.5 h-3.5" /> Gym Access
                </div>
                <div className={`flex items-center gap-1.5 text-xs ${p.includesClasses ? "text-green-600" : "text-gray-300"}`}>
                  <CheckCircle className="w-3.5 h-3.5" /> Classes Included
                </div>
                {p.totalClasses && <div className="text-xs text-gray-500">{p.totalClasses} total classes</div>}
                {p.sessionsPerWeek && <div className="text-xs text-gray-500">{p.sessionsPerWeek} sessions/week</div>}
              </div>
              <div className="flex gap-2 pt-3 border-t border-border">
                <button onClick={() => openEdit(p)} data-testid={`button-edit-package-${p.id}`} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-primary transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => deleteMutation.mutate(p.id)} data-testid={`button-delete-package-${p.id}`} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors ml-auto">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-900">{editing ? "Edit Package" : "Add Package"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Package Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Monthly Premium"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              {[["price","Price ($)","number"],["durationDays","Duration (days)","number"],["sessionsPerWeek","Sessions/Week","number"],["totalClasses","Total Classes","number"]].map(([k,l,t]) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{l}</label>
                  <input type={t} step={k === "price" ? "0.01" : "1"} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} required={k === "price" || k === "durationDays"}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch (leave empty for global)</label>
                <select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Global (all branches)</option>
                  {(branches as any[]).map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <div className="col-span-2 flex items-center gap-6">
                {[["includesGymAccess","Includes Gym Access"],["includesClasses","Includes Classes"]].map(([k,l]) => (
                  <label key={k} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} className="rounded" />
                    {l}
                  </label>
                ))}
              </div>
              <div className="col-span-2 flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isPending} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
