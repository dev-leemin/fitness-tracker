"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Header() {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetch("/api/workout/streak")
      .then((r) => r.json())
      .then((data) => setStreak(data.streak || 0))
      .catch(() => {});
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-40 bg-[#0F1119]/60 backdrop-blur-2xl border-b border-white/[0.04]">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-[#6366F1] flex items-center justify-center shadow-[0_4px_12px_rgba(124,92,252,0.3)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-gradient tracking-tight">FitLog</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Streak Badge */}
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FB923C]/10 border border-[#FB923C]/20 backdrop-blur-sm float-slow">
              <span className="streak-fire text-sm">🔥</span>
              <span className="text-xs font-bold text-[#FB923C]">{streak}일</span>
            </div>
          )}

          {session?.user && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/[0.04] transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C5CFC]/20 to-[#A78BFA]/20 border border-[#7C5CFC]/20 flex items-center justify-center shadow-[0_0_12px_rgba(124,92,252,0.1)]">
                  <span className="text-[11px] font-bold text-[#A78BFA]">
                    {session.user.nickname?.[0] || session.user.name?.[0]}
                  </span>
                </div>
                <span className="hidden sm:block text-[13px] text-white/50 font-medium">
                  {session.user.nickname || session.user.name}
                </span>
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-[#161B2E]/95 backdrop-blur-2xl rounded-2xl border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-20 py-1.5 overflow-hidden">
                    <Link
                      href="/profile"
                      className="block px-4 py-2.5 text-[13px] text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      프로필 설정
                    </Link>
                    <Link
                      href="/stats"
                      className="block px-4 py-2.5 text-[13px] text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      내 통계
                    </Link>
                    <hr className="my-1.5 border-white/[0.04]" />
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="block w-full text-left px-4 py-2.5 text-[13px] text-[#F87171]/70 hover:text-[#F87171] hover:bg-[#F87171]/[0.04] transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}