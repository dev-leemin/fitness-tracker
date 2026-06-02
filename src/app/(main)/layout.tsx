import SessionProvider from "@/components/layout/SessionProvider";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-white flex justify-center">
        <div className="w-full max-w-[480px] relative bg-white">
          <MobileHeader />
          <main className="pt-14 pb-20 px-4 py-4">
            {children}
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </SessionProvider>
  );
}
