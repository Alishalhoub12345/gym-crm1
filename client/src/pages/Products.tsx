import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Plus, Edit2, Trash2, Loader2, X } from "lucide-react";

const emptyForm = { name: "", description: "", price: "", stockQty: "0", category: "", imageUrl: "", branchId: "", status: "active" };

export default function Products() {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const { data: products = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/products"] });
  const { data: branches = [] } = useQuery<any[]>({ queryKey: ["/api/branches"] });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/products", data).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/products"] }); closeModal(); toast({ title: "Product created" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => apiRequest("PUT", `/api/products/${id}`, data).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/products"] }); closeModal(); toast({ title: "Product updated" }); },
    onError: () => toast({ title: "Error", description: "Failed to update", variant: "destructive" }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/products/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/products"] }); toast({ title: "Product deleted" }); },
    onError: () => toast({ title: "Error", description: "Failed to delete", variant: "destructive" }),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || "", price: p.price, stockQty: p.stockQty || "0", category: p.category || "", imageUrl: p.imageUrl || "", branchId: p.branchId || "", status: p.status });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(emptyForm); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, price: parseFloat(form.price), stockQty: parseInt(form.stockQty) || 0, branchId: form.branchId ? parseInt(form.branchId) : null };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">Supplements and gym merchandise</p>
        </div>
        <button onClick={openCreate} data-testid="button-add-product"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                {["Product", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(products as any[]).length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No products yet</td></tr>
              ) : (products as any[]).map((p: any) => (
                <tr key={p.id} data-testid={`product-row-${p.id}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{p.description}</div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">{p.category || "—"}</td>
                  <td className="px-4 py-3.5 font-medium text-gray-900">${parseFloat(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${parseInt(p.stockQty) > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {p.stockQty} in stock
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteMutation.mutate(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-semibold text-gray-900">{editing ? "Edit Product" : "Add Product"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Whey Protein"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price ($)</label>
                <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Qty</label>
                <input type="number" value={form.stockQty} onChange={(e) => setForm({ ...form, stockQty: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Supplements, Gear..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
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
