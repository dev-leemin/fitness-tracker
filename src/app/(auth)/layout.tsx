export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#050508]">
      {/* Left Visual Panel - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden items-center justify-center">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a0f] via-[#050508] to-[#0a0f1a]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,255,135,0.4) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        {/* Large ambient glows */}
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-[#00FF87]/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-[#00D4FF]/[0.03] rounded-full blur-[100px]" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#00FF87]/[0.02] rounded-full blur-[80px]" />

        {/* Content */}
        <div className="relative z-10 px-16 max-w-[540px]">
          {/* Floating stats cards */}
          <div className="mb-12 relative">
            {/* Main illustration area */}
            <div className="relative w-full aspect-square max-w-[360px] mx-auto">
              {/* Circular ring */}
              <svg className="absolute inset-0 w-full h-full animate-[spin_60s_linear_infinite]" viewBox="0 0 360 360" fill="none">
                <circle cx="180" cy="180" r="160" stroke="url(#ring-gradient)" strokeWidth="1" strokeDasharray="8 12" opacity="0.3" />
                <defs>
                  <linearGradient id="ring-gradient" x1="0" y1="0" x2="360" y2="360">
                    <stop offset="0%" stopColor="#00FF87" />
                    <stop offset="100%" stopColor="#00D4FF" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center icon group */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#00FF87]/10 to-[#00D4FF]/5 border border-[#00FF87]/20 flex items-center justify-center backdrop-blur-sm">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#00FF87" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                    <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
                  </svg>
                </div>
              </div>

              {/* Floating stat card 1 - Top right */}
              <div className="absolute top-8 right-0 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md animate-[float_6s_ease-in-out_infinite]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#00FF87]/10 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00FF87" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 font-medium">이번 주</p>
                    <p className="text-sm font-bold text-white">4회 운동</p>
                  </div>
                </div>
              </div>

              {/* Floating stat card 2 - Bottom left */}
              <div className="absolute bottom-12 left-0 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md animate-[float_6s_ease-in-out_infinite_2s]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FF8C00]/10 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF8C00" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 font-medium">연속</p>
                    <p className="text-sm font-bold text-white">12일 streak</p>
                  </div>
                </div>
              </div>

              {/* Floating stat card 3 - Top left */}
              <div className="absolute top-20 -left-4 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md animate-[float_6s_ease-in-out_infinite_4s]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 font-medium">그룹</p>
                    <p className="text-sm font-bold text-white">5명 참여</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className="text-center">
            <h2 className="text-[28px] font-bold text-white leading-tight">
              운동을 기록하고<br />
              <span className="bg-gradient-to-r from-[#00FF87] to-[#00D4FF] bg-clip-text text-transparent">
                함께 성장하세요
              </span>
            </h2>
            <p className="text-[14px] text-white/35 mt-4 leading-relaxed">
              매일의 운동을 기록하고, 그룹원들과 함께<br />
              목표를 달성해보세요
            </p>
          </div>

          {/* Mini feature list */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00FF87" strokeWidth="2" strokeLinecap="round" className="opacity-60">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p className="text-[11px] text-white/30 font-medium">캘린더</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" className="opacity-60">
                  <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <p className="text-[11px] text-white/30 font-medium">통계</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" className="opacity-60">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p className="text-[11px] text-white/30 font-medium">그룹</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 relative overflow-hidden">
        {/* Subtle background for form side */}
        <div className="absolute inset-0 bg-[#050508]" />
        <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-[#00FF87]/[0.015] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[300px] h-[300px] bg-[#00D4FF]/[0.01] rounded-full blur-[100px]" />

        {/* Left border accent */}
        <div className="hidden lg:block absolute left-0 top-[20%] bottom-[20%] w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

        <div className="relative z-10 w-full max-w-[380px]">{children}</div>
      </div>
    </div>
  );
}
