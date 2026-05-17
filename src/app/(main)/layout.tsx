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
      <main className="relative pt-14 pb-24 lg:pb-6 lg:pl-56">
        {/* Liquid background blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="liquid-blob w-[500px] h-[500px] bg-[#7C5CFC]/[0.04] top-[-10%] right-[-10%]" />
          <div className="liquid-blob-2 w-[400px] h-[400px] bg-[#34D399]/[0.03] bottom-[10%] left-[-5%]" />
          <div className="liquid-blob-3 w-[350px] h-[350px] bg-[#60A5FA]/[0.03] top-[40%] right-[20%]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 py-5 sm:px-6">
          {children}
        </div>
      </main>
      <MobileBottomNav />
    </SessionProvider>
  );
}