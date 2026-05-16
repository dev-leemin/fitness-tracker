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
      <main className="pt-16 pb-20 lg:pb-0 lg:pl-64">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
          {children}
        </div>
      </main>
      <MobileBottomNav />
    </SessionProvider>
  );
}
