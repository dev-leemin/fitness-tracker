"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "대시보드", icon: "📊" },
  { href: "/workout", label: "운동 기록", icon: "💪" },
  { href: "/calendar", label: "캘린더", icon: "📅" },
  { href: "/stats", label: "통계", icon: "📈" },
  { href: "/group", label: "그룹", icon: "👥" },
  { href: "/posts", label: "운동 일지", icon: "📝" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-16">
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? "nav-link-active" : ""}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-gray-200">
        <Link href="/profile" className="nav-link">
          <span className="text-lg">⚙️</span>
          <span>설정</span>
        </Link>
      </div>
    </aside>
  );
}
