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
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-12 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200">
      <div className="flex items-center justify-between h-full px-4">
        <Link href="/dashboard" className="flex items-center gap-1.5">
          <span className="text-[14px] font-bold text-stone-900 tracking-tight">FitLog</span>
        </Link>

        <div className="flex items-center gap-2">
          {session?.user && streak > 0 && (
            <span className="text-[10px] font-medium text-stone-400">{streak}일 연속</span>
          )}

          {session?.user ? (
            <Link href="/profile" className="flex items-center">
              <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
                <span className="text-[10px] font-medium text-orange-600">
                  {session.user.nickname?.[0] || session.user.name?.[0]}
                </span>
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-[11px] font-medium text-orange-500 hover:text-orange-600 transition-colors"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
