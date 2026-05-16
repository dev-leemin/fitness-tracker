"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "대시보드", icon: "◆" },
  { href: "/workout", label: "운동 기록", icon: "▲" },
  { href: "/calendar", label: "캘린더", icon: "◉" },
  { href: "/stats", label: "통계", icon: "◈" },
  { href: "/group", label: "그룹", icon: "⬡" },
  { href: "/posts", label: "운동 일지", icon: "▣" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 lg:border-r lg:border-white/[0.06] lg:bg-[#07070d]/50 lg:backdrop-blur-xl lg:pt-16">
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? "nav-link-active" : ""}`}
            >
              <span className={`text-sm ${isActive ? "text-[#00FF87]" : "text-white/40"}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <Link href="/profile" className="nav-link">
          <span className="text-sm text-white/40">⚙</span>
          <span>설정</span>
        </Link>
      </div>
    </aside>
  );
}
