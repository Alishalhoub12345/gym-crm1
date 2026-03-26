import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Edit2, Trash2, Loader2, X, CheckCircle } from "lucide-react";

const emptyForm = {
  name: "",
  tier: "bronze",
  billingCycle: "1_month",
  description: "",
  price: "",
  durationDays: "30",
  branchId: "",
  gymAccessHours: "",
  coachHours: "0",
  dietitianHours: "0",
  sessionsPerWeek: "",
  totalClasses: "",
  includesGymAccess: true,
  includesClasses: true,
  allowsAllBranches: false,
  status: "active",
};

const cycleDays: Record<string, number> = {
  "1_month": 30,
  "3_months": 90,
  "1_year": 365,
};

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
    setForm({
      name: p.name,
      tier: p.tier,
      billingCycle: p.billingCycle,
      description: p.description || "",
      price: p.price,
      durationDays: p.durationDays,
      branchId: p.branchId || "",
      gymAccessHours: p.gymAccessHours || "",
      coachHours: p.coachHours ?? "0",
      dietitianHours: p.dietitianHours ?? "0",
      sessionsPerWeek: p.sessionsPerWeek || "",
      totalClasses: p.totalClasses || "",
      includesGymAccess: p.includesGymAccess,
      includesClasses: p.includesClasses,
      allowsAllBranches: p.allowsAllBranches,
      status: p.status,
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(emptyForm); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      durationDays: cycleDays[form.billingCycle] || parseInt(form.durationDays),
      price: parseFloat(form.price),
      branchId: form.branchId ? parseInt(form.branchId) : null,
      gymAccessHours: form.gymAccessHours ? parseInt(form.gymAccessHours) : null,
      coachHours: form.coachHours ? parseInt(form.coachHours) : 0,
      dietitianHours: form.dietitianHours ? parseInt(form.dietitianHours) : 0,
      sessionsPerWeek: form.sessionsPerWeek ? parseInt(form.sessionsPerWeek) : null,
      totalClasses: form.totalClasses ? parseInt(form.totalClasses) : null,
    };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
          <p className="mt-1 text-sm text-gray-500">Bronze, Silver, Gold packages with time-based benefits</p>
        </div>
        <button onClick={openCreate} data-testid="button-add-package"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 sm:w-auto">
          <Plus className="w-4 h-4" /> Add Package
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(packages as any[]).length === 0 ? (
            <div className="col-span-3 py-16 text-center text-gray-400">No packages yet</div>
          ) : (packages as any[]).map((p: any) => (
            <div key={p.id} data-testid={`package-card-${p.id}`} className="rounded-xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{p.status}</span>
              </div>
              <h3 className="mb-1 font-semibold text-gray-900">{p.name}</h3>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#8a6b00]">
                {(p.tier || "bronze")} · {String(p.billingCycle || "1_month").replace(/_/g, " ")}
              </div>
              <div className="mb-1 text-2xl font-bold text-primary">${parseFloat(p.price).toFixed(2)}</div>
              <div className="mb-3 text-sm text-gray-500">{p.durationDays} days</div>
              {p.description && <p className="mb-3 line-clamp-2 text-xs text-gray-400">{p.description}</p>}
              <div className="mb-4 space-y-1.5">
                <div className={`flex items-center gap-1.5 text-xs ${p.includesGymAccess ? "text-green-600" : "text-gray-300"}`}>
                  <CheckCircle className="h-3.5 w-3.5" /> Gym Access
                </div>
                <div className={`flex items-center gap-1.5 text-xs ${p.includesClasses ? "text-green-600" : "text-gray-300"}`}>
                  <CheckCircle className="h-3.5 w-3.5" /> Classes Included
                </div>
                <div className="text-xs text-gray-500">{p.gymAccessHours || 0} gym hours</div>
                <div className="text-xs text-gray-500">{p.coachHours || 0} coach hours</div>
                <div className="text-xs text-gray-500">{p.dietitianHours || 0} dietitian hours</div>
                <div className="text-xs text-gray-500">{p.allowsAllBranches ? "All branches access" : "Single branch access"}</div>
                {p.totalClasses && <div className="text-xs text-gray-500">{p.totalClasses} total classes</div>}
                {p.sessionsPerWeek && <div className="text-xs text-gray-500">{p.sessionsPerWeek} sessions/week</div>}
              </div>
              <div className="flex gap-2 border-t border-border pt-3">
                <button onClick={() => openEdit(p)} data-testid={`button-edit-package-${p.id}`} className="flex items-center gap-1.5 text-xs text-gray-600 transition-colors hover:text-primary">
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => deleteMutation.mutate(p.id)} data-testid={`button-delete-package-${p.id}`} className="ml-auto flex items-center gap-1.5 text-xs text-red-500 transition-colors hover:text-red-700">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-white p-5">
              <h2 className="font-semibold text-gray-900">{editing ? "Edit Package" : "Add Package"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Package Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Silver 3 Months"
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Tier</label>
                <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value, allowsAllBranches: e.target.value === "gold" ? true : form.allowsAllBranches })}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Billing Cycle</label>
                <select value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="1_month">1 month</option>
                  <option value="3_months">3 months</option>
                  <option value="1_year">1 year</option>
                </select>
              </div>
              {[["price","Price ($)","number"],["gymAccessHours","Gym Access Hours","number"],["coachHours","Coach Hours","number"],["dietitianHours","Dietitian Hours","number"],["sessionsPerWeek","Sessions/Week","number"],["totalClasses","Total Classes","number"]].map(([k,l,t]) => (
                <div key={k}>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">{l}</label>
                  <input type={t} step={k === "price" ? "0.01" : "1"} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} required={k === "price"}
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Branch</label>
                <select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Global (all branches)</option>
                  {(branches as any[]).map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="col-span-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
                {[["includesGymAccess","Includes Gym Access"],["includesClasses","Includes Classes"],["allowsAllBranches","Access All Branches"]].map(([k,l]) => (
                  <label key={k} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} className="rounded" />
                    {l}
                  </label>
                ))}
              </div>
              <div className="col-span-2 flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isPending} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
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
