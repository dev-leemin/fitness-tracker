"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-40 backdrop-blur-2xl bg-[#050508]/80 border-b border-white/[0.04]">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00FF87] to-[#00c96b] flex items-center justify-center">
            <span className="text-xs font-black text-black">F</span>
          </div>
          <span className="text-sm font-bold text-white/90">FitLog</span>
        </Link>

        {session?.user && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.03] transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00FF87]/15 to-[#00D4FF]/15 border border-white/[0.06] flex items-center justify-center">
                <span className="text-[10px] font-bold text-[#00FF87]/80">
                  {session.user.nickname?.[0] || session.user.name?.[0]}
                </span>
              </div>
              <span className="hidden sm:block text-[13px] font-medium text-white/50">
                {session.user.nickname || session.user.name}
              </span>
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-1.5 w-44 backdrop-blur-2xl bg-[#0f0f18]/95 rounded-xl border border-white/[0.06] shadow-2xl z-20 py-1 overflow-hidden">
                  <Link
                    href="/profile"
                    className="block px-3.5 py-2 text-[13px] text-white/55 hover:text-white hover:bg-white/[0.03] transition-colors cursor-pointer"
                    onClick={() => setShowMenu(false)}
                  >
                    프로필 설정
                  </Link>
                  <Link
                    href="/stats"
                    className="block px-3.5 py-2 text-[13px] text-white/55 hover:text-white hover:bg-white/[0.03] transition-colors cursor-pointer"
                    onClick={() => setShowMenu(false)}
                  >
                    내 통계
                  </Link>
                  <hr className="my-1 border-white/[0.04]" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="block w-full text-left px-3.5 py-2 text-[13px] text-[#FF006E]/80 hover:bg-[#FF006E]/5 transition-colors cursor-pointer"
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
