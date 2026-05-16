import SessionProvider from "@/components/layout/SessionProvider";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -right-60 w-[500px] h-[500px] rounded-full bg-[#00FF87]/[0.015] blur-[150px]" />
        <div className="absolute -bottom-60 -left-60 w-[400px] h-[400px] rounded-full bg-[#00D4FF]/[0.015] blur-[150px]" />
      </div>

      <Header />
      <Sidebar />
      <main className="relative pt-14 pb-20 lg:pb-6 lg:pl-60">
        <div className="max-w-4xl mx-auto px-4 py-5 sm:px-6">
          {children}
        </div>
      </main>
      <MobileBottomNav />
    </SessionProvider>
  );
}
