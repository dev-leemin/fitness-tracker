"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-40 bg-[#09090B]/80 backdrop-blur-xl border-b border-white/[0.04]">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#6366F1] flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white/90 tracking-tight">FitLog</span>
        </Link>

        {session?.user && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                <span className="text-[10px] font-bold text-white/60">
                  {session.user.nickname?.[0] || session.user.name?.[0]}
                </span>
              </div>
              <span className="hidden sm:block text-[13px] text-white/45">
                {session.user.nickname || session.user.name}
              </span>
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-44 bg-[#131316]/98 backdrop-blur-xl rounded-xl border border-white/[0.06] shadow-2xl z-20 py-1 overflow-hidden">
                  <Link
                    href="/profile"
                    className="block px-3.5 py-2.5 text-[13px] text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    프로필 설정
                  </Link>
                  <Link
                    href="/stats"
                    className="block px-3.5 py-2.5 text-[13px] text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    내 통계
                  </Link>
                  <hr className="my-1 border-white/[0.04]" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="block w-full text-left px-3.5 py-2.5 text-[13px] text-[#EF4444]/70 hover:text-[#EF4444] hover:bg-[#EF4444]/[0.04] transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
