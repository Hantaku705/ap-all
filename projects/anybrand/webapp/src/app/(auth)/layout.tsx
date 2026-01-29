import Sidebar from "@/components/layout/Sidebar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <Sidebar />
      <main className="pl-64 transition-all">
        <div className="min-h-screen p-6">{children}</div>
      </main>
    </div>
  );
}
