"use client";

import { useRef, useEffect, useState } from "react";

function AnimatedCard({ children }: { children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="relative group"
    >
      {/* Animated gradient border */}
      <div
        className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `conic-gradient(from var(--border-angle, 0deg), transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)`,
          animation: "border-rotate 4s linear infinite",
        }}
      />

      {/* Spotlight glow following cursor */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.03), transparent 60%)`,
        }}
      />

      {/* Card content */}
      <div
        className="relative rounded-xl p-6 sm:p-8"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset, 0 20px 50px rgba(0,0,0,0.3)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 relative overflow-hidden">
      {/* Animated CSS */}
      <style>{`
        @property --border-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes border-rotate {
          to { --border-angle: 360deg; }
        }
        @keyframes grid-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(24px); }
        }
      `}</style>

      {/* Moving dot grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          animation: "grid-move 8s linear infinite",
        }}
      />
      {/* Radial fade */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, transparent 20%, rgb(10,10,14) 70%)",
        }}
      />

      {/* Ambient glow orbs */}
      <div className="fixed top-[20%] left-[15%] w-[300px] h-[300px] bg-white/[0.01] blur-[100px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[20%] right-[15%] w-[250px] h-[250px] bg-white/[0.008] blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10 min-h-screen flex">
        {/* Left panel — branding (desktop) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative">
          <div className="relative">
            <span className="text-[14px] font-semibold text-neutral-200 tracking-tight">FitLog</span>
          </div>

          <div className="relative max-w-md">
            <h1 className="text-[26px] font-bold text-neutral-100 leading-[1.35] tracking-tight">
              매일의 운동이 쌓여
              <br />
              <span className="text-neutral-400">눈에 보이는 기록이 됩니다</span>
            </h1>
            <p className="text-[13px] text-neutral-600 mt-4 leading-relaxed">
              캘린더에 쌓이는 컬러 스탬프, 끊기지 않는 스트릭,
              <br />
              친구들과의 주간 챌린지를 한 곳에서.
            </p>

            {/* Activity feed mockup — social proof */}
            <div className="mt-8 space-y-3">
              {[
                { name: "지민", action: "달리기 5.2km", time: "방금 전", color: "#86EFAC" },
                { name: "현우", action: "웨이트 트레이닝 45분", time: "12분 전", color: "#93C5FD" },
                { name: "수아", action: "요가 30분", time: "1시간 전", color: "#D8B4FE" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold"
                    style={{ background: `${item.color}15`, color: item.color }}
                  >
                    {item.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-neutral-300">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-neutral-500 ml-1">{item.action}</span>
                    </p>
                  </div>
                  <span className="text-[9px] text-neutral-700">{item.time}</span>
                </div>
              ))}
            </div>

            {/* Streak counter */}
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-4 h-4 rounded-full bg-orange-400/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400/80" />
              </div>
              <span className="text-[11px] text-neutral-400 font-medium">평균 연속 기록 <span className="text-neutral-200">23일</span></span>
            </div>
          </div>

          <div className="relative">
            <p className="text-[11px] text-neutral-800">© 2026 FitLog</p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-[380px]">
            {/* Mobile logo */}
            <div className="lg:hidden mb-8">
              <span className="text-[14px] font-semibold text-neutral-200 tracking-tight">FitLog</span>
            </div>

            <AnimatedCard>
              {children}
            </AnimatedCard>
          </div>
        </div>
      </div>
    </div>
  );
}
