import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f3efe5]">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="min-h-screen flex-1 md:ml-64">
        <div className="sticky top-0 z-20 border-b border-[#e5dcc8] bg-[#f3efe5]/95 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-[#d9cfba] bg-white px-3 py-2 text-[#181818] shadow-sm"
            >
              <Menu className="h-5 w-5" />
            </button>
            <img
              src="/start-gym-logo.jpg"
              alt="Start Gym Living Right"
              className="h-11 w-auto rounded-xl border border-black/10 bg-[#6b6b70] p-1"
            />
          </div>
        </div>
        <div className="mx-auto max-w-7xl p-4 sm:p-5 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
