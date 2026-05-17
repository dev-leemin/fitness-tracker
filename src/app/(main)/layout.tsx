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
      <Header />
      <Sidebar />
      <main className="relative pt-14 pb-24 lg:pb-6 lg:pl-56 bg-neutral-950 min-h-screen">
        {/* Dot grid background */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="fixed inset-0 pointer-events-none z-[1]"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, transparent 40%, rgb(10,10,14) 80%)",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-4 py-5 sm:px-6">
          {children}
        </div>
      </main>
      <MobileBottomNav />
    </SessionProvider>
  );
}
