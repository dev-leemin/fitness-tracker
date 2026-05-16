export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#09090B]">
      {/* Left Visual Panel - Desktop only */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden items-end">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0d1a] via-[#0c0f1a] to-[#09090B]" />

        {/* Subtle ambient blobs */}
        <div className="absolute top-[15%] left-[25%] w-[500px] h-[500px] rounded-full bg-[#6366F1]/[0.04] blur-[120px] animate-[aurora_15s_ease-in-out_infinite]" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#8B5CF6]/[0.03] blur-[100px] animate-[aurora_15s_ease-in-out_infinite_5s]" />

        {/* Content */}
        <div className="relative z-10 p-12 pb-16 w-full">
          {/* Logo */}
          <div className="absolute top-12 left-12">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#6366F1] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white/50">FitLog</span>
            </div>
          </div>

          {/* Hero text */}
          <div className="mt-auto">
            <h1 className="text-[38px] font-bold text-white leading-[1.15] tracking-tight">
              매일의 운동이<br />
              <span className="text-[#6366F1]">기록</span>이 되고,<br />
              습관이 됩니다.
            </h1>
            <p className="text-[15px] text-white/30 mt-6 leading-relaxed max-w-[360px]">
              그룹과 함께 운동 목표를 달성하고,
              나만의 운동 데이터를 쌓아보세요.
            </p>
          </div>

          {/* Feature row */}
          <div className="flex items-center gap-5 mt-10">
            {[
              { label: "운동 기록", sub: "매일 트래킹" },
              { label: "그룹 챌린지", sub: "함께 달성" },
              { label: "통계 분석", sub: "성장 확인" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-1 h-1 rounded-full bg-[#6366F1]/60" />
                <div>
                  <p className="text-[12px] font-medium text-white/60">{item.label}</p>
                  <p className="text-[10px] text-white/25">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="relative z-10 w-full max-w-[380px]">{children}</div>
      </div>
    </div>
  );
}
