"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const navItems = [
  { href: "/", label: "홈", icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a2 2 0 01-2 2H5a2 2 0 01-2-2V9.5z"/><path d="M9 22V12h6v10"/></svg>
  )},
  { href: "/calendar", label: "캘린더", icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  )},
  { href: "/workout/new", label: "", icon: null, isAction: true },
  { href: "/more", label: "더보기", icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
  )},
  { href: "/profile", label: "프로필", icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )},
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50">
      <div className="bg-white shadow-[0_-1px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around h-[58px] px-1">
          {navItems.map((item) => {
            const isActive = item.isAction
              ? false
              : item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            if (item.isAction) {
              const actionHref = session?.user
                ? item.href
                : `/login?callbackUrl=${encodeURIComponent(item.href)}`;

              return (
                <Link
                  key={item.href}
                  href={actionHref}
                  className="flex items-center justify-center -mt-5"
                >
                  <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-[#FC5200] to-[#FF6B2B] flex items-center justify-center shadow-[0_4px_20px_rgba(252,82,0,0.35)] transition-transform active:scale-90">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 transition-colors ${
                  isActive ? "text-[#FC5200]" : "text-stone-400"
                }`}
              >
                <span>{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-[#FC5200] -mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom,0px)]" />
      </div>
    </nav>
  );
}
