"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 backdrop-blur-xl bg-[#07070d]/80 border-b border-white/[0.06]">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FF87] to-[#00D4FF] flex items-center justify-center">
            <span className="text-sm font-black text-black">F</span>
          </div>
          <span className="text-base font-bold text-white">FitLog</span>
        </Link>

        {session?.user && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/[0.04] transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00FF87]/20 to-[#00D4FF]/20 border border-[#00FF87]/20 flex items-center justify-center">
                <span className="text-xs font-bold text-[#00FF87]">
                  {session.user.nickname?.[0] || session.user.name?.[0]}
                </span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-white/70">
                {session.user.nickname || session.user.name}
              </span>
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 backdrop-blur-xl bg-[#15151f]/95 rounded-xl border border-white/10 shadow-2xl z-20 py-1 overflow-hidden">
                  <Link
                    href="/profile"
                    className="block px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    프로필 설정
                  </Link>
                  <Link
                    href="/stats"
                    className="block px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    내 통계
                  </Link>
                  <hr className="my-1 border-white/[0.06]" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="block w-full text-left px-4 py-2.5 text-sm text-[#FF006E] hover:bg-[#FF006E]/10 transition-colors"
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
