"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, useScroll, useInView, animate } from "framer-motion";

// Spotlight SVG component (Aceternity-inspired)
function Spotlight({ className = "" }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
      className={`pointer-events-none absolute z-0 ${className}`}
    >
      <div
        className="w-[600px] h-[600px] sm:w-[900px] sm:h-[900px]"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)",
        }}
      />
    </motion.div>
  );
}

// Feature card with cursor spotlight
function FeatureCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  return (
    <div
      ref={ref}
      className={`relative group ${className}`}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        setMousePos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(300px circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.04), transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
}

// 3D tilt
function Tilt({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [4, -4]), { stiffness: 200, damping: 22 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-4, 4]), { stiffness: 200, damping: 22 });

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
}

// Animated number counter
function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, target, { duration: 2, ease: "easeOut", onUpdate: (v) => setCount(Math.round(v)) });
    return () => ctrl.stop();
  }, [inView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// Calendar stamps — the hero visual anchor
function CalendarVisual() {
  const stamps = [
    { active: true, color: "#86EFAC" },
    { active: true, color: "#93C5FD" },
    { active: true, color: "#86EFAC" },
    { active: false, color: "" },
    { active: true, color: "#FCD34D" },
    { active: true, color: "#93C5FD" },
    { active: false, color: "" },
  ];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="flex items-center gap-2.5 sm:gap-3">
      {stamps.map((s, i) => (
        <motion.div
          key={i}
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 + i * 0.06 }}
        >
          <span className="text-[10px] text-neutral-500 font-mono">{days[i]}</span>
          <motion.div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : {}}
            transition={{ delay: 1 + i * 0.06, type: "spring", stiffness: 300, damping: 20 }}
            style={{
              background: s.active ? `${s.color}12` : "rgba(255,255,255,0.02)",
              border: s.active ? `1px solid ${s.color}30` : "1px solid rgba(255,255,255,0.04)",
            }}
          >
            {s.active && (
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color, opacity: 0.8 }} />
            )}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.98]);

  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white antialiased">
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
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          animation: "grid-move 8s linear infinite",
        }}
      />
      {/* Radial vignette mask over grid */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, transparent 30%, rgb(10,10,14) 75%)",
        }}
      />

      {/* Ambient glow orbs */}
      <div className="fixed top-[15%] left-[20%] w-[350px] h-[350px] bg-white/[0.008] blur-[100px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[25%] right-[15%] w-[280px] h-[280px] bg-white/[0.006] blur-[80px] rounded-full pointer-events-none z-0" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="h-14 flex items-center justify-between border-b border-white/[0.04]">
            <Link href="/" className="text-[13px] font-semibold tracking-tight text-neutral-200">
              FitLog
            </Link>
            <Link
              href="/login"
              className="text-[12px] text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              로그인
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <motion.section
        className="relative z-10 pt-32 sm:pt-44 pb-20 sm:pb-32 px-6 sm:px-8"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <Spotlight className="-top-[300px] left-1/2 -translate-x-1/2" />

        <div className="max-w-3xl mx-auto text-center relative">
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 border border-white/[0.06] rounded-full px-3.5 py-1 mb-7"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
            <span className="text-[11px] text-neutral-400 font-medium">운동 기록 & 그룹 챌린지</span>
          </motion.div>

          {/* Heading — gradient text */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="text-[clamp(2.2rem,5.5vw,3.8rem)] font-bold leading-[1.1] tracking-[-0.04em]"
          >
            <span className="bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
              매일의 운동이 쌓여
            </span>
            <br />
            <span className="bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
              눈에 보이는 기록이 됩니다
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="text-[14px] sm:text-[15px] text-neutral-500 mt-5 leading-relaxed max-w-md mx-auto"
          >
            캘린더에 쌓이는 컬러 스탬프, 끊기지 않는 스트릭,
            <br className="hidden sm:block" />
            친구들과의 주간 챌린지를 한 곳에서.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 flex items-center justify-center gap-4"
          >
            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-[13px] font-medium bg-white text-neutral-900 px-5 py-2.5 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                시작하기
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </motion.div>
            <Link
              href="/login"
              className="text-[13px] text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              이미 계정이 있나요?
            </Link>
          </motion.div>

          {/* Hero card — the calendar mockup with animated border */}
          {mounted && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="mt-16 sm:mt-20"
              style={{ perspective: "1200px" }}
            >
              <Tilt>
                <div className="relative mx-auto max-w-lg group">
                  {/* Animated rotating gradient border */}
                  <div
                    className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{
                      background: `conic-gradient(from var(--border-angle, 0deg), transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`,
                      animation: "border-rotate 4s linear infinite",
                    }}
                  />

                  <div
                    className="relative rounded-xl overflow-hidden p-6 sm:p-8"
                    style={{
                      background: "linear-gradient(145deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
                      border: "1px solid rgba(255,255,255,0.06)",
                      boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset, 0 30px 60px -12px rgba(0,0,0,0.5)",
                    }}
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[11px] text-neutral-500 font-medium">5월 3주차</span>
                        <span className="text-[11px] text-neutral-600 font-mono">12일 연속</span>
                      </div>

                      <div className="flex justify-center">
                        <CalendarVisual />
                      </div>

                      <div className="mt-7 pt-5 border-t border-white/[0.04] grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-lg font-semibold text-neutral-200">5/7</p>
                          <p className="text-[10px] text-neutral-600 mt-0.5">이번 주</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-neutral-200">85%</p>
                          <p className="text-[10px] text-neutral-600 mt-0.5">달성률</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-neutral-200">34일</p>
                          <p className="text-[10px] text-neutral-600 mt-0.5">최고 기록</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Tilt>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* ===== FEATURES + STATS combined ===== */}
      <section className="relative z-10 py-16 sm:py-24 px-6 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[11px] text-neutral-600 font-medium tracking-widest uppercase mb-10 text-center"
          >
            Features
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-xl overflow-hidden border border-white/[0.04]">
            {[
              {
                title: "스탬프 캘린더",
                desc: "운동을 완료하면 캘린더에 컬러 스탬프가 찍힙니다. 카테고리별 색상으로 운동 패턴을 한눈에.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-neutral-400">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                    <circle cx="8" cy="16" r="1.5" fill="currentColor" opacity="0.4" />
                    <circle cx="12" cy="16" r="1.5" fill="currentColor" opacity="0.4" />
                  </svg>
                ),
              },
              {
                title: "연속 기록",
                desc: "하루도 빠지지 않고 이어가는 스트릭. 기록이 길어질수록 포기할 수 없게 됩니다.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-neutral-400">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                ),
              },
              {
                title: "그룹 챌린지",
                desc: "친구들과 주간 목표를 공유하고 서로의 진행률을 실시간으로 확인하세요.",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-neutral-400">
                    <circle cx="9" cy="7" r="4" />
                    <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                    <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" />
                  </svg>
                ),
              },
            ].map((f, i) => (
              <FeatureCard key={i} className="bg-neutral-950 hover:bg-neutral-950/50 transition-colors">
                <motion.div
                  className="relative p-6 sm:p-8"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="mb-4 opacity-60 group-hover:opacity-100 transition-opacity">
                    {f.icon}
                  </div>
                  <h3 className="text-[14px] font-semibold text-neutral-200 mb-2">{f.title}</h3>
                  <p className="text-[12px] text-neutral-500 leading-[1.7]">{f.desc}</p>
                </motion.div>
              </FeatureCard>
            ))}
          </div>

          {/* Stats — tighter spacing, directly below features */}
          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            {[
              { value: 12, suffix: "종", label: "운동 카테고리" },
              { value: 34, suffix: "일", label: "최고 연속 기록" },
              { value: 85, suffix: "%", label: "주간 달성률" },
            ].map((n, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-b from-neutral-100 to-neutral-400 bg-clip-text text-transparent tracking-tight">
                  <AnimatedNumber target={n.value} suffix={n.suffix} />
                </p>
                <p className="text-[11px] text-neutral-600 mt-1.5">{n.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative z-10 py-20 sm:py-28 px-6 sm:px-8">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent tracking-tight">
            오늘부터 기록하세요
          </h2>
          <p className="text-[13px] text-neutral-600 mt-2 mb-7">이메일 하나면 충분합니다.</p>
          <motion.div className="inline-block" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-[13px] font-medium bg-white text-neutral-900 px-5 py-2.5 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              시작하기
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] py-5 px-6 sm:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-[11px] text-neutral-700">FitLog</span>
          <span className="text-[10px] text-neutral-800">© 2026</span>
        </div>
      </footer>
    </div>
  );
}
