import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Dumbbell, Plus, Search, Edit2, Trash2, Loader2, X, Users } from "lucide-react";

const emptyForm = { branchId: "", title: "", description: "", coachId: "", classDate: "", startTime: "", endTime: "", capacity: "20", priceExtra: "", requiresExtraPayment: false, status: "scheduled" };

export default function Classes() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const { data: classes = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/classes"] });
  const { data: branches = [] } = useQuery<any[]>({ queryKey: ["/api/branches"] });
  const { data: coaches = [] } = useQuery<any[]>({ queryKey: ["/api/coaches"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/classes", data).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/classes"] }); closeModal(); toast({ title: "Class created" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => apiRequest("PUT", `/api/classes/${id}`, data).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/classes"] }); closeModal(); toast({ title: "Class updated" }); },
    onError: () => toast({ title: "Error", description: "Failed to update", variant: "destructive" }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/classes/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/classes"] }); toast({ title: "Class deleted" }); },
    onError: () => toast({ title: "Error", description: "Failed to delete", variant: "destructive" }),
  });

  const canManage = user?.role === "owner" || user?.role === "admin";
  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, branchId: user?.branchId?.toString() || "" }); setShowModal(true); };
  const openEdit = (c: any) => {
    setEditing(c);
    setForm({ branchId: c.branchId || "", title: c.title || "", description: c.description || "", coachId: c.coachId || "", classDate: c.classDate || "", startTime: c.startTime || "", endTime: c.endTime || "", capacity: c.capacity || "20", priceExtra: c.priceExtra || "", requiresExtraPayment: c.requiresExtraPayment || false, status: c.status || "scheduled" });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(emptyForm); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, branchId: parseInt(form.branchId) || 1, coachId: form.coachId ? parseInt(form.coachId) : null, capacity: parseInt(form.capacity), priceExtra: form.priceExtra ? parseFloat(form.priceExtra) : null };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const filtered = (classes as any[]).filter((c: any) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.coachName || "").toLowerCase().includes(search.toLowerCase())
  );
  const isPending = createMutation.isPending || updateMutation.isPending;

  const statusColor = (s: string) => s === "scheduled" ? "bg-green-100 text-green-700" : s === "canceled" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600";

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-500 text-sm mt-1">{classes.length} classes total</p>
        </div>
        {canManage && (
          <button onClick={openCreate} data-testid="button-add-class"
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Class
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search classes..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  {["Class", "Coach", "Date & Time", "Branch", "Capacity", "Status", ...(canManage ? ["Actions"] : [])].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No classes found</td></tr>
                ) : filtered.map((c: any) => (
                  <tr key={c.id} data-testid={`class-row-${c.id}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-gray-900">{c.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{c.description}</div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{c.coachName || "—"}</td>
                    <td className="px-4 py-3.5 text-gray-600">
                      <div>{c.classDate}</div>
                      <div className="text-xs text-gray-400">{c.startTime} – {c.endTime}</div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{c.branchName}</td>
                    <td className="px-4 py-3.5 text-gray-600">
                      <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-gray-400" /> {c.capacity}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(c.status)}`}>{c.status}</span>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(c)} data-testid={`button-edit-class-${c.id}`} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => deleteMutation.mutate(c.id)} data-testid={`button-delete-class-${c.id}`} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && canManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-900">{editing ? "Edit Class" : "Add Class"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch</label>
                <select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required>
                  <option value="">Select branch</option>
                  {(branches as any[]).map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Coach</label>
                <select value={form.coachId} onChange={(e) => setForm({ ...form, coachId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">No coach</option>
                  {(coaches as any[]).map((c: any) => <option key={c.id} value={c.id}>{c.userName}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Class Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Morning Yoga"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              {[["classDate","Date","date"],["startTime","Start Time","time"],["endTime","End Time","time"],["capacity","Capacity","number"]].map(([k,l,t]) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{l}</label>
                  <input type={t} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} required
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Extra Price (if any)</label>
                <input type="number" step="0.01" value={form.priceExtra} onChange={(e) => setForm({ ...form, priceExtra: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="scheduled">Scheduled</option>
                  <option value="canceled">Canceled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="requiresExtra" checked={form.requiresExtraPayment} onChange={(e) => setForm({ ...form, requiresExtraPayment: e.target.checked })} className="rounded" />
                <label htmlFor="requiresExtra" className="text-sm text-gray-700">Requires extra payment</label>
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
