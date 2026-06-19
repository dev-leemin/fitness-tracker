"use client";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-[480px] px-6">
        {children}
      </div>
    </div>
  );
}
