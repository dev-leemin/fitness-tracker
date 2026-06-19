"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function MobileHeader() {
  const { data: session } = useSession();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/workout/streak")
      .then((r) => r.json())
      .then((data) => setStreak(data.streak || 0))
      .catch(() => {});
  }, [session]);

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-12 z-40 bg-white">
      <div className="flex items-center justify-between h-full px-5">
        <Link href="/" className="flex items-center">
          <span className="text-[16px] font-extrabold text-stone-900 tracking-tight">FitLog</span>
        </Link>

        <div className="flex items-center gap-3">
          {session?.user && streak > 0 && (
            <span className="text-[11px] font-semibold text-[#FC5200]">🔥 {streak}일</span>
          )}

          {session?.user ? (
            <Link href="/profile" className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#FFF4ED] flex items-center justify-center">
                <span className="text-[11px] font-bold text-[#FC5200]">
                  {session.user.nickname?.[0] || session.user.name?.[0]}
                </span>
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-[13px] font-semibold text-[#FC5200] hover:text-[#E04800] transition-colors"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
    </header>
  );
}
