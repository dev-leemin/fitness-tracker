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
      <main className="relative pt-14 pb-24 lg:pb-6 lg:pl-56 bg-stone-50 min-h-screen">
        <div className="relative max-w-3xl mx-auto px-4 py-5 sm:px-6">
          {children}
        </div>
      </main>
      <MobileBottomNav />
    </SessionProvider>
  );
}