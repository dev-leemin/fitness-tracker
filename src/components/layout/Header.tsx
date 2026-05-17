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
    <header className="fixed top-0 left-0 right-0 h-14 z-40 bg-neutral-950/80 backdrop-blur-2xl border-b border-white/[0.04]">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-neutral-200 tracking-tight">FitLog</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Streak Badge */}
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[11px] font-medium text-neutral-400">{streak}일 연속</span>
            </div>
          )}

          {session?.user && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                  <span className="text-[10px] font-medium text-neutral-400">
                    {session.user.nickname?.[0] || session.user.name?.[0]}
                  </span>
                </div>
                <span className="hidden sm:block text-[12px] text-neutral-500 font-medium">
                  {session.user.nickname || session.user.name}
                </span>
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-44 bg-neutral-900/95 backdrop-blur-xl rounded-lg border border-white/[0.06] shadow-[0_16px_48px_rgba(0,0,0,0.5)] z-20 py-1 overflow-hidden">
                    <Link
                      href="/profile"
                      className="block px-3.5 py-2 text-[12px] text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03] transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      프로필 설정
                    </Link>
                    <Link
                      href="/stats"
                      className="block px-3.5 py-2 text-[12px] text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03] transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      내 통계
                    </Link>
                    <hr className="my-1 border-white/[0.04]" />
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="block w-full text-left px-3.5 py-2 text-[12px] text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.03] transition-colors"
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
