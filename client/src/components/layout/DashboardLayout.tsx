import Sidebar from "./Sidebar";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
