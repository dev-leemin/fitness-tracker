export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#0c0a14]">
      {/* Left Visual Panel - Desktop only */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden items-end">
        {/* Rich gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0f2e] via-[#0f1a2e] to-[#0c0a14]" />

        {/* Aurora blobs */}
        <div className="absolute top-[-10%] left-[30%] w-[600px] h-[600px] rounded-full bg-[#6366F1]/[0.08] blur-[120px] animate-[aurora_12s_ease-in-out_infinite]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#EC4899]/[0.06] blur-[100px] animate-[aurora_12s_ease-in-out_infinite_4s]" />
        <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#3B82F6]/[0.05] blur-[100px] animate-[aurora_12s_ease-in-out_infinite_8s]" />

        {/* Grain overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`
        }} />

        {/* Content */}
        <div className="relative z-10 p-12 pb-16 w-full">
          {/* Top logo area */}
          <div className="absolute top-12 left-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#EC4899] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="text-[15px] font-semibold text-white/60">FitLog</span>
            </div>
          </div>

          {/* Main hero text */}
          <div className="mt-auto">
            <h1 className="text-[42px] font-extrabold text-white leading-[1.1] tracking-tight">
              매일의 운동이<br />
              <span className="bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#EC4899] bg-clip-text text-transparent">
                기록이 되고,
              </span><br />
              습관이 됩니다.
            </h1>
            <p className="text-[16px] text-white/40 mt-6 leading-relaxed max-w-[380px]">
              그룹과 함께 운동 목표를 달성하고,<br />
              나만의 운동 데이터를 쌓아보세요.
            </p>
          </div>

          {/* Bottom stats row */}
          <div className="flex items-center gap-6 mt-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="opacity-50">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white/80">운동 기록</p>
                <p className="text-[11px] text-white/30">매일 트래킹</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/[0.06]" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="opacity-50">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white/80">그룹 챌린지</p>
                <p className="text-[11px] text-white/30">함께 달성</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/[0.06]" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="opacity-50">
                  <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white/80">통계 분석</p>
                <p className="text-[11px] text-white/30">성장 확인</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 bg-[#0c0a14]" />
        {/* Subtle gradient from left panel bleeding in */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[200px] bg-gradient-to-r from-[#6366F1]/[0.02] to-transparent" />

        <div className="relative z-10 w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
