"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "홈", icon: "◆" },
  { href: "/workout", label: "운동", icon: "▲" },
  { href: "/workout/new", label: "", icon: "+", isAction: true },
  { href: "/calendar", label: "캘린더", icon: "◉" },
  { href: "/group", label: "그룹", icon: "⬡" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#07070d]/90 border-t border-white/[0.06]">
      <div className="flex items-center justify-around h-16 px-2">
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00FF87] to-[#00D4FF] flex items-center justify-center shadow-[0_0_20px_rgba(0,255,135,0.3)]">
                  <span className="text-xl font-bold text-black">+</span>
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg transition-all ${
                isActive ? "text-[#00FF87]" : "text-white/40"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
