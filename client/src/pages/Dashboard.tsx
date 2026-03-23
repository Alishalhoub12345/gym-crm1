import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, Dumbbell, UserCheck, DollarSign, TrendingUp, Calendar, Loader2 } from "lucide-react";

interface Stats {
  totalMembers: number;
  totalCoaches: number;
  totalClasses: number;
  totalRevenue: number;
  totalLeads: number;
  activeSubscriptions: number;
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/dashboard/stats"],
    enabled: user?.role === "owner" || user?.role === "admin",
  });

  const { data: classes } = useQuery<any[]>({
    queryKey: ["/api/classes"],
  });

  const statCards = [
    { label: "Total Members", value: stats?.totalMembers ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Subscriptions", value: stats?.activeSubscriptions ?? 0, icon: Calendar, color: "text-green-600", bg: "bg-green-50" },
    { label: "Coaches", value: stats?.totalCoaches ?? 0, icon: UserCheck, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Classes", value: stats?.totalClasses ?? 0, icon: Dumbbell, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Total Revenue", value: `$${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "CRM Leads", value: stats?.totalLeads ?? 0, icon: TrendingUp, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, <span className="font-medium text-gray-700">{user?.name}</span>
          {user?.role !== "owner" && " — viewing your branch"}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {(user?.role === "owner" || user?.role === "admin") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="stat-card" data-testid={`stat-${card.label.toLowerCase().replace(/ /g, "-")}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-500">{card.label}</span>
                      <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                        <Icon className={`w-4.5 h-4.5 ${card.color}`} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Upcoming Classes */}
          <div className="bg-white rounded-xl border border-border shadow-sm">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-gray-900">Upcoming Classes</h2>
            </div>
            <div className="divide-y divide-border">
              {!classes || classes.length === 0 ? (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">No classes scheduled</div>
              ) : (
                classes.slice(0, 6).map((cls: any) => (
                  <div key={cls.id} className="px-5 py-3.5 flex items-center gap-4" data-testid={`class-row-${cls.id}`}>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Dumbbell className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{cls.title}</div>
                      <div className="text-xs text-gray-500">{cls.classDate} · {cls.startTime} – {cls.endTime}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-gray-500">{cls.branchName}</div>
                      <div className="text-xs text-gray-400">{cls.coachName || "No coach"}</div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      cls.status === "scheduled" ? "bg-green-100 text-green-700" :
                      cls.status === "canceled" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {cls.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
