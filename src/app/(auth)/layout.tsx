export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1119] relative overflow-hidden">
      {/* Liquid blobs background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="liquid-blob w-[600px] h-[600px] bg-[#7C5CFC]/[0.08] top-[-20%] left-[-10%]" />
        <div className="liquid-blob-2 w-[500px] h-[500px] bg-[#34D399]/[0.05] bottom-[-15%] right-[-10%]" />
        <div className="liquid-blob-3 w-[400px] h-[400px] bg-[#60A5FA]/[0.04] top-[30%] right-[10%]" />
      </div>

      {/* Glass card container */}
      <div className="relative z-10 w-full max-w-[420px] mx-4">
        <div className="card-glass !p-8 sm:!p-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-[#6366F1] flex items-center justify-center shadow-[0_4px_12px_rgba(124,92,252,0.3)] float-slow">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="text-base font-bold text-gradient">FitLog</span>
          </div>

          {children}
        </div>

        {/* Decorative element below card */}
        <div className="absolute -bottom-4 left-[10%] right-[10%] h-8 bg-[#7C5CFC]/5 rounded-3xl blur-xl pointer-events-none" />
      </div>
    </div>
  );
}
