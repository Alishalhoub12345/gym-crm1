import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Search, Edit2, Trash2, Loader2, X, Eye } from "lucide-react";

const emptyForm = {
  name: "", email: "", phone: "", password: "",
  branchId: "", gender: "", birthDate: "", joinDate: new Date().toISOString().split("T")[0],
  membershipNumber: "", status: "active", emergencyContact: "", notes: "",
  height: "", weight: "", fitnessGoal: "",
};

export default function Members() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const { data: members = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/members"] });
  const { data: branches = [] } = useQuery<any[]>({ queryKey: ["/api/branches"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/members", data).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/members"] }); closeModal(); toast({ title: "Member created" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message || "Failed to create member", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => apiRequest("PUT", `/api/members/${id}`, data).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/members"] }); closeModal(); toast({ title: "Member updated" }); },
    onError: () => toast({ title: "Error", description: "Failed to update member", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/members/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/members"] }); toast({ title: "Member deleted" }); },
    onError: () => toast({ title: "Error", description: "Failed to delete member", variant: "destructive" }),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (m: any) => {
    setEditing(m);
    setForm({
      name: m.userName || "", email: m.userEmail || "", phone: m.userPhone || "", password: "",
      branchId: m.branchId || "", gender: m.gender || "", birthDate: m.birthDate || "",
      joinDate: m.joinDate || "", membershipNumber: m.membershipNumber || "",
      status: m.status || "active", emergencyContact: m.emergencyContact || "",
      notes: m.notes || "", height: m.height || "", weight: m.weight || "", fitnessGoal: m.fitnessGoal || "",
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(emptyForm); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, branchId: parseInt(form.branchId) || 1 };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const f = (k: string, label: string, type = "text", placeholder = "") => (
    <div key={k}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={form[k]} placeholder={placeholder}
        onChange={(e) => setForm({ ...form, [k]: e.target.value })}
        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
    </div>
  );

  const filtered = members.filter(m =>
    (m.userName || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.userEmail || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.membershipNumber || "").toLowerCase().includes(search.toLowerCase())
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-500 text-sm mt-1">{members.length} total members</p>
        </div>
        <button onClick={openCreate} data-testid="button-add-member"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search members..."
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
                  {["Member", "Branch", "Join Date", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No members found</td></tr>
                ) : filtered.map((m) => (
                  <tr key={m.id} data-testid={`member-row-${m.id}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-gray-900">{m.userName}</div>
                      <div className="text-xs text-gray-500">{m.userEmail}</div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{m.branchName}</td>
                    <td className="px-4 py-3.5 text-gray-600">{m.joinDate || "—"}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        m.status === "active" ? "bg-green-100 text-green-700" :
                        m.status === "expired" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>{m.status}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(m)} data-testid={`button-edit-member-${m.id}`}
                          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteMutation.mutate(m.id)} data-testid={`button-delete-member-${m.id}`}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-900">{editing ? "Edit Member" : "Add Member"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!editing && <>
                  {f("name", "Full Name", "text", "John Doe")}
                  {f("email", "Email", "email", "john@example.com")}
                  {f("phone", "Phone", "tel", "+1-555-0100")}
                  {f("password", "Password (default: Member@2024)", "password", "Leave blank for default")}
                </>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch</label>
                  <select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required>
                    <option value="">Select branch</option>
                    {(branches as any[]).map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {f("birthDate", "Birth Date", "date")}
                {f("joinDate", "Join Date", "date")}
                {f("membershipNumber", "Membership Number", "text", "MEM-001")}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="frozen">Frozen</option>
                  </select>
                </div>
                {f("emergencyContact", "Emergency Contact", "text")}
                {f("height", "Height (cm)", "number")}
                {f("weight", "Weight (kg)", "number")}
                {f("fitnessGoal", "Fitness Goal", "text", "e.g. Weight loss")}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-5 pt-4 border-t border-border">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isPending} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? "Update Member" : "Create Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
