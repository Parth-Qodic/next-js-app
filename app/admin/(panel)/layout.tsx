import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-100">
      {/* Background gradient decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[128px]" />
      </div>
      <Sidebar />
      <div className="ml-64 relative z-10">
        <Header />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
