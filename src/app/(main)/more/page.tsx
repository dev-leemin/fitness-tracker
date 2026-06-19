"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const menuItems = [
  { href: "/workout", label: "운동 기록", icon: "🏋️", desc: "나의 운동 히스토리" },
  { href: "/stats", label: "통계", icon: "📊", desc: "운동 패턴 분석" },
  { href: "/group", label: "그룹", icon: "👥", desc: "함께 운동하기" },
  { href: "/posts", label: "일지", icon: "📝", desc: "운동 일지 기록" },
];

export default function MorePage() {
  const { data: session } = useSession();

  return (
    <div className="pt-2">
      <h1 className="text-[20px] font-bold text-stone-900 tracking-tight">더보기</h1>

      <div className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 py-4 border-b border-stone-100 last:border-0 hover:bg-stone-50 -mx-2 px-2 rounded-lg transition-colors"
          >
            <span className="text-[22px] w-9 text-center">{item.icon}</span>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-stone-800">{item.label}</p>
              <p className="text-[12px] text-stone-400 mt-0.5">{item.desc}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D6D3D1" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </Link>
        ))}
      </div>

      {/* App info */}
      <div className="mt-8 pt-6 border-t border-stone-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-stone-300">FitLog v1.0</p>
          </div>
          <div className="flex gap-4">
            <Link href="/terms" className="text-[11px] text-stone-300 hover:text-stone-500 transition-colors">
              이용약관
            </Link>
            <Link href="/privacy" className="text-[11px] text-stone-300 hover:text-stone-500 transition-colors">
              개인정보처리방침
            </Link>
          </div>
        </div>
      </div>

      {session?.user && (
        <div className="mt-6">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-[14px] text-red-400 font-medium hover:text-red-500 transition-colors"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
