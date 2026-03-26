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
    { label: "Total Members", value: stats?.totalMembers ?? 0, icon: Users, color: "text-[#181818]", bg: "bg-[#f4b516]/20" },
    { label: "Active Subscriptions", value: stats?.activeSubscriptions ?? 0, icon: Calendar, color: "text-[#181818]", bg: "bg-[#f6e8a6]" },
    { label: "Coaches", value: stats?.totalCoaches ?? 0, icon: UserCheck, color: "text-[#181818]", bg: "bg-[#ddd5bf]" },
    { label: "Classes", value: stats?.totalClasses ?? 0, icon: Dumbbell, color: "text-[#181818]", bg: "bg-[#f4b516]/25" },
    { label: "Total Revenue", value: `$${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign, color: "text-[#181818]", bg: "bg-[#e6dcc5]" },
    { label: "CRM Leads", value: stats?.totalLeads ?? 0, icon: TrendingUp, color: "text-[#181818]", bg: "bg-[#f6e8a6]" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6 rounded-[28px] border border-[#ddd5bf] bg-white/80 p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-[#181818]">Start Living Right Dashboard</h1>
        <p className="mt-1 text-sm text-[#5f584c]">
          Welcome back, <span className="font-medium text-[#181818]">{user?.name}</span>
          {user?.role !== "owner" && " - viewing your branch"}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {(user?.role === "owner" || user?.role === "admin") && (
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="stat-card" data-testid={`stat-${card.label.toLowerCase().replace(/ /g, "-")}`}>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-[#6b6253]">{card.label}</span>
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.bg}`}>
                        <Icon className={`h-4.5 w-4.5 ${card.color}`} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-[#181818]">{card.value}</div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="rounded-[28px] border border-[#ddd5bf] bg-white/90 shadow-sm">
            <div className="border-b border-[#e7dfcd] px-5 py-4">
              <h2 className="text-base font-semibold text-[#181818]">Upcoming Classes</h2>
            </div>
            <div className="divide-y divide-[#efe8d8]">
              {!classes || classes.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-[#8e856f]">No classes scheduled</div>
              ) : (
                classes.slice(0, 6).map((cls: any) => (
                  <div key={cls.id} className="flex items-center gap-4 px-5 py-3.5" data-testid={`class-row-${cls.id}`}>
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#f4b516]/20">
                      <Dumbbell className="h-5 w-5 text-[#181818]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-[#181818]">{cls.title}</div>
                      <div className="text-xs text-[#7e7562]">{cls.classDate} - {cls.startTime} to {cls.endTime}</div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-xs text-[#6a6357]">{cls.branchName}</div>
                      <div className="text-xs text-[#9c927d]">{cls.coachName || "No coach"}</div>
                    </div>
                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
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
