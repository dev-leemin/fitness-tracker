"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "홈", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  )},
  { href: "/workout", label: "운동", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5h11M6.5 17.5h11M2 12h2m16 0h2M6 12H4.5a2.5 2.5 0 0 1 0-5H6m0 10h-.5a2.5 2.5 0 0 0 0 5H6m12-10h.5a2.5 2.5 0 0 0 0-5H18m0 10h.5a2.5 2.5 0 0 1 0 5H18"/></svg>
  )},
  { href: "/workout/new", label: "", icon: null, isAction: true },
  { href: "/calendar", label: "캘린더", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  )},
  { href: "/group", label: "그룹", icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )},
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Glass background */}
      <div className="absolute inset-0 bg-[#0B0E18]/80 backdrop-blur-2xl border-t border-white/[0.06] rounded-t-[20px]" />

      <div className="relative flex items-center justify-around h-[64px] px-2">
        {navItems.map((item) => {
          const isActive = item.isAction
            ? pathname === item.href
            : pathname.startsWith(item.href);

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#6366F1] flex items-center justify-center shadow-[0_4px_20px_rgba(124,92,252,0.4),0_0_40px_rgba(124,92,252,0.15)] transition-transform active:scale-90 hover:scale-105">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 transition-all duration-200 ${
                isActive ? "text-white" : "text-white/30"
              }`}
            >
              <span className={`transition-all duration-200 ${isActive ? "text-[#A78BFA] scale-110" : "text-white/30"}`}>
                {item.icon}
              </span>
              <span className="text-[9px] font-medium">{item.label}</span>
              {/* Active dot indicator */}
              {isActive && (
                <div className="absolute bottom-2 w-1 h-1 rounded-full bg-[#7C5CFC] shadow-[0_0_6px_rgba(124,92,252,0.5)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}