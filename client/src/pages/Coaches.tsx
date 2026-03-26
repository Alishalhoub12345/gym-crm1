import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getPasswordChecks, isStrongPassword } from "@/lib/password";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, Plus, Search, Edit2, Trash2, Loader2, X } from "lucide-react";

const emptyForm = { name: "", email: "", phone: "", password: "", branchId: "", specialization: "", hireDate: "", salary: "", bio: "", status: "active" };

export default function Coaches() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const { data: coaches = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/coaches"] });
  const { data: branches = [] } = useQuery<any[]>({ queryKey: ["/api/branches"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/coaches", data).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/coaches"] }); closeModal(); toast({ title: "Coach created" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message || "Failed to create coach", variant: "destructive" }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => apiRequest("PUT", `/api/coaches/${id}`, data).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/coaches"] }); closeModal(); toast({ title: "Coach updated" }); },
    onError: () => toast({ title: "Error", description: "Failed to update", variant: "destructive" }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/coaches/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/coaches"] }); toast({ title: "Coach deleted" }); },
    onError: () => toast({ title: "Error", description: "Failed to delete", variant: "destructive" }),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c: any) => {
    setEditing(c);
    setForm({ name: c.userName || "", email: c.userEmail || "", phone: c.userPhone || "", password: "", branchId: c.branchId || "", specialization: c.specialization || "", hireDate: c.hireDate || "", salary: c.salary || "", bio: c.bio || "", status: c.status || "active" });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(emptyForm); };
  const passwordChecks = getPasswordChecks(form.password || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing && !isStrongPassword(form.password || "Coach@2024")) {
      toast({ title: "Weak password", description: "Password must include one capital letter, one number, and one special character.", variant: "destructive" });
      return;
    }
    const data = { ...form, branchId: parseInt(form.branchId) || 1, salary: form.salary ? parseFloat(form.salary) : undefined };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const filtered = (coaches as any[]).filter((c: any) =>
    (c.userName || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.specialization || "").toLowerCase().includes(search.toLowerCase())
  );
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coaches</h1>
          <p className="text-gray-500 text-sm mt-1">{coaches.length} coaches registered</p>
        </div>
        <button onClick={openCreate} data-testid="button-add-coach"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 sm:w-auto">
          <Plus className="w-4 h-4" /> Add Coach
        </button>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search coaches..."
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
                  {["Coach", "Specialization", "Branch", "Hire Date", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No coaches found</td></tr>
                ) : filtered.map((c: any) => (
                  <tr key={c.id} data-testid={`coach-row-${c.id}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-gray-900">{c.userName}</div>
                      <div className="text-xs text-gray-500">{c.userEmail}</div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{c.specialization || "—"}</td>
                    <td className="px-4 py-3.5 text-gray-600">{c.branchName}</td>
                    <td className="px-4 py-3.5 text-gray-600">{c.hireDate || "—"}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${c.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(c)} data-testid={`button-edit-coach-${c.id}`} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteMutation.mutate(c.id)} data-testid={`button-delete-coach-${c.id}`} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-900">{editing ? "Edit Coach" : "Add Coach"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              {!editing && <>
                {[["name","Full Name","text","John Smith"],["email","Email","email","coach@gym.com"],["phone","Phone","tel",""]].map(([k,l,t,p]) => (
                  <div key={k}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{l}</label>
                    <input type={t} value={form[k]} placeholder={p} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <input type="password" value={form.password} placeholder="default: Coach@2024" onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <div className="mt-2 space-y-1 text-xs">
                    <div className={passwordChecks.hasUppercase || !form.password ? "text-green-600" : "text-gray-500"}>One capital letter</div>
                    <div className={passwordChecks.hasDigit || !form.password ? "text-green-600" : "text-gray-500"}>One digit</div>
                    <div className={passwordChecks.hasSpecial || !form.password ? "text-green-600" : "text-gray-500"}>One special character</div>
                  </div>
                </div>
              </>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch</label>
                <select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required>
                  <option value="">Select branch</option>
                  {(branches as any[]).map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              {[["specialization","Specialization","text","Yoga, Boxing..."],["hireDate","Hire Date","date",""],["salary","Salary","number",""]].map(([k,l,t,p]) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{l}</label>
                  <input type={t} value={form[k]} placeholder={p} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3}
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
