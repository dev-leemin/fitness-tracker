"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🏋️</span>
          <span className="text-lg font-bold text-gray-900">FitLog</span>
        </Link>

        {session?.user && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {session.user.nickname?.[0] || session.user.name?.[0]}
                </span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {session.user.nickname || session.user.name}
              </span>
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg z-20 py-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowMenu(false)}
                  >
                    프로필 설정
                  </Link>
                  <Link
                    href="/stats"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowMenu(false)}
                  >
                    내 통계
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
