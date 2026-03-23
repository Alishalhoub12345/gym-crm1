import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Salad, Plus, Edit2, Trash2, Loader2, X } from "lucide-react";

const emptyForm = { memberId: "", dietitianId: "", title: "", description: "", startDate: "", endDate: "", calories: "", protein: "", carbs: "", fat: "", notes: "" };

export default function DietPlans() {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const { data: plans = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/diet-plans"] });
  const { data: members = [] } = useQuery<any[]>({ queryKey: ["/api/members"] });
  const { data: users = [] } = useQuery<any[]>({ queryKey: ["/api/users"] });

  const dietitians = (users as any[]).filter((u: any) => u.role === "dietitian" || u.role === "owner" || u.role === "admin");

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/diet-plans", data).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/diet-plans"] }); closeModal(); toast({ title: "Diet plan created" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => apiRequest("PUT", `/api/diet-plans/${id}`, data).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/diet-plans"] }); closeModal(); toast({ title: "Diet plan updated" }); },
    onError: () => toast({ title: "Error", description: "Failed to update", variant: "destructive" }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/diet-plans/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/diet-plans"] }); toast({ title: "Diet plan deleted" }); },
    onError: () => toast({ title: "Error", description: "Failed to delete", variant: "destructive" }),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ memberId: p.memberId || "", dietitianId: p.dietitianId || "", title: p.title, description: p.description || "", startDate: p.startDate || "", endDate: p.endDate || "", calories: p.calories || "", protein: p.protein || "", carbs: p.carbs || "", fat: p.fat || "", notes: p.notes || "" });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(emptyForm); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, memberId: parseInt(form.memberId), dietitianId: form.dietitianId ? parseInt(form.dietitianId) : null, calories: form.calories ? parseInt(form.calories) : null, protein: form.protein ? parseFloat(form.protein) : null, carbs: form.carbs ? parseFloat(form.carbs) : null, fat: form.fat ? parseFloat(form.fat) : null };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diet Plans</h1>
          <p className="text-gray-500 text-sm mt-1">{plans.length} plans created</p>
        </div>
        <button onClick={openCreate} data-testid="button-add-diet-plan"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Diet Plan
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(plans as any[]).length === 0 ? (
            <div className="col-span-3 text-center py-16 text-gray-400">No diet plans yet</div>
          ) : (plans as any[]).map((p: any) => (
            <div key={p.id} data-testid={`diet-plan-card-${p.id}`} className="bg-white rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                  <Salad className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{p.title}</h3>
              <div className="text-sm text-gray-500 mb-2">For: {p.memberName || "—"}</div>
              {p.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{p.description}</p>}
              {(p.calories || p.protein || p.carbs || p.fat) && (
                <div className="grid grid-cols-2 gap-2 mb-3 p-2.5 bg-gray-50 rounded-lg">
                  {p.calories && <div className="text-xs"><span className="text-gray-500">Calories:</span> <span className="font-medium">{p.calories}</span></div>}
                  {p.protein && <div className="text-xs"><span className="text-gray-500">Protein:</span> <span className="font-medium">{p.protein}g</span></div>}
                  {p.carbs && <div className="text-xs"><span className="text-gray-500">Carbs:</span> <span className="font-medium">{p.carbs}g</span></div>}
                  {p.fat && <div className="text-xs"><span className="text-gray-500">Fat:</span> <span className="font-medium">{p.fat}g</span></div>}
                </div>
              )}
              {(p.startDate || p.endDate) && (
                <div className="text-xs text-gray-400 mb-3">{p.startDate} – {p.endDate}</div>
              )}
              <div className="flex gap-2 pt-3 border-t border-border">
                <button onClick={() => openEdit(p)} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-primary"><Edit2 className="w-3.5 h-3.5" /> Edit</button>
                <button onClick={() => deleteMutation.mutate(p.id)} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 ml-auto"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-900">{editing ? "Edit Diet Plan" : "Add Diet Plan"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Member</label>
                <select value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required>
                  <option value="">Select member</option>
                  {(members as any[]).map((m: any) => <option key={m.id} value={m.id}>{m.userName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Dietitian</label>
                <select value={form.dietitianId} onChange={(e) => setForm({ ...form, dietitianId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">No dietitian</option>
                  {dietitians.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Plan Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Weight Loss Plan"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              {[["startDate","Start Date","date"],["endDate","End Date","date"],["calories","Daily Calories","number"],["protein","Protein (g)","number"],["carbs","Carbs (g)","number"],["fat","Fat (g)","number"]].map(([k,l,t]) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{l}</label>
                  <input type={t} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
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
