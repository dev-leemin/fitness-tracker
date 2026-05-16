"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "홈", icon: "🏠" },
  { href: "/workout", label: "운동", icon: "💪" },
  { href: "/workout/new", label: "기록", icon: "➕", isAction: true },
  { href: "/calendar", label: "캘린더", icon: "📅" },
  { href: "/group", label: "그룹", icon: "👥" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
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
                className="flex flex-col items-center justify-center -mt-4"
              >
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl shadow-lg">
                  {item.icon}
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 ${
                isActive ? "text-primary" : "text-gray-500"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
