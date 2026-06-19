"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Header() {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/workout/streak")
      .then((r) => r.json())
      .then((data) => setStreak(data.streak || 0))
      .catch(() => {});
  }, [session]);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-stone-900 tracking-tight">FitLog</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Streak Badge (logged in only) */}
          {session?.user && streak > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200">
              <span className="text-[11px] font-medium text-stone-500">{streak}일 연속</span>
            </div>
          )}

          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-orange-600">
                    {session.user.nickname?.[0] || session.user.name?.[0]}
                  </span>
                </div>
                <span className="hidden sm:block text-[12px] text-stone-600 font-medium">
                  {session.user.nickname || session.user.name}
                </span>
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg border border-stone-200 shadow-lg z-20 py-1 overflow-hidden">
                    <Link
                      href="/profile"
                      className="block px-3.5 py-2 text-[12px] text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      프로필 설정
                    </Link>
                    <Link
                      href="/stats"
                      className="block px-3.5 py-2 text-[12px] text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      내 통계
                    </Link>
                    <hr className="my-1 border-stone-100" />
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="block w-full text-left px-3.5 py-2 text-[12px] text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-[12px] font-medium text-stone-500 hover:text-stone-700 transition-colors px-3 py-1.5"
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="text-[12px] font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors px-3.5 py-1.5 rounded-lg"
              >
                시작하기
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}