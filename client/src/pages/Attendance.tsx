import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ClipboardCheck, Plus, Loader2, X } from "lucide-react";

const emptyForm = { memberId: "", branchId: "", classId: "", attendanceType: "gym_entry", notes: "" };

export default function Attendance() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);

  const { data: records = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/attendance"] });
  const { data: members = [] } = useQuery<any[]>({ queryKey: ["/api/members"] });
  const { data: branches = [] } = useQuery<any[]>({ queryKey: ["/api/branches"] });
  const { data: classes = [] } = useQuery<any[]>({ queryKey: ["/api/classes"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/attendance", data).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/attendance"] }); setShowModal(false); setForm(emptyForm); toast({ title: "Attendance recorded" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      memberId: parseInt(form.memberId),
      branchId: parseInt(form.branchId) || user?.branchId || 1,
      classId: form.classId ? parseInt(form.classId) : null,
      attendanceType: form.attendanceType,
      notes: form.notes,
      markedBy: user?.id,
    });
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">{(records as any[]).length} records total</p>
        </div>
        <button onClick={() => setShowModal(true)} data-testid="button-add-attendance"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Mark Attendance
        </button>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  {["Member", "Type", "Class", "Branch", "Check-in Time", "Notes"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(records as any[]).length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No attendance records</td></tr>
                ) : (records as any[]).map((r: any) => (
                  <tr key={r.id} data-testid={`attendance-row-${r.id}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-gray-900">{r.memberName}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.attendanceType === "gym_entry" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                        {r.attendanceType === "gym_entry" ? "Gym Entry" : "Class"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{r.classTitle || "—"}</td>
                    <td className="px-4 py-3.5 text-gray-600">{r.branchName}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{r.checkinTime ? new Date(r.checkinTime).toLocaleString() : "—"}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs">{r.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-semibold text-gray-900">Mark Attendance</h2>
              <button onClick={() => { setShowModal(false); setForm(emptyForm); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Member</label>
                <select value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required>
                  <option value="">Select member</option>
                  {(members as any[]).map((m: any) => <option key={m.id} value={m.id}>{m.userName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Attendance Type</label>
                <select value={form.attendanceType} onChange={(e) => setForm({ ...form, attendanceType: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="gym_entry">Gym Entry</option>
                  <option value="class_attendance">Class Attendance</option>
                </select>
              </div>
              {form.attendanceType === "class_attendance" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Class</label>
                  <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">Select class</option>
                    {(classes as any[]).map((c: any) => <option key={c.id} value={c.id}>{c.title} - {c.classDate}</option>)}
                  </select>
                </div>
              )}
              {user?.role === "owner" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Branch</label>
                  <select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">Select branch</option>
                    {(branches as any[]).map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setForm(emptyForm); }} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Mark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
