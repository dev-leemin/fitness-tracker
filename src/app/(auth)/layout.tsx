"use client";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-50 relative overflow-hidden">
      <div className="relative z-10 min-h-screen flex">
        {/* Left panel — branding (desktop) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative bg-white border-r border-stone-200">
          <div className="relative">
            <span className="text-[14px] font-semibold text-stone-900 tracking-tight">FitLog</span>
          </div>

          <div className="relative max-w-md">
            <h1 className="text-[26px] font-bold text-stone-900 leading-[1.35] tracking-tight">
              매일의 운동이 쌓여
              <br />
              <span className="text-stone-400">눈에 보이는 기록이 됩니다</span>
            </h1>
            <p className="text-[13px] text-stone-400 mt-4 leading-relaxed">
              캘린더에 쌓이는 컬러 스탬프, 끊기지 않는 스트릭,
              <br />
              친구들과의 주간 챌린지를 한 곳에서.
            </p>

            {/* Activity feed mockup — social proof */}
            <div className="mt-8 space-y-3">
              {[
                { name: "지민", action: "달리기 5.2km", time: "방금 전", color: "#10B981" },
                { name: "현우", action: "웨이트 트레이닝 45분", time: "12분 전", color: "#3B82F6" },
                { name: "수아", action: "요가 30분", time: "1시간 전", color: "#8B5CF6" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-stone-50 border border-stone-200"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold"
                    style={{ background: `${item.color}15`, color: item.color }}
                  >
                    {item.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-stone-600">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-stone-400 ml-1">{item.action}</span>
                    </p>
                  </div>
                  <span className="text-[9px] text-stone-300">{item.time}</span>
                </div>
              ))}
            </div>

            {/* Streak counter */}
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-50 border border-stone-200">
              <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              </div>
              <span className="text-[11px] text-stone-400 font-medium">평균 연속 기록 <span className="text-stone-700">23일</span></span>
            </div>
          </div>

          <div className="relative">
            <p className="text-[11px] text-stone-300">© 2026 FitLog</p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-[380px]">
            {/* Mobile logo */}
            <div className="lg:hidden mb-8">
              <span className="text-[14px] font-semibold text-stone-900 tracking-tight">FitLog</span>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-6 sm:p-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
