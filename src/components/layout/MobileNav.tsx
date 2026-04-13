"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, History, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/history", label: "History", icon: History },
  { href: "/scan",    label: "Scan",    icon: Camera },
  { href: "/track",   label: "Track",   icon: LineChart },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-amber-100 bg-white/95 backdrop-blur-sm safe-area-pb">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-2xl px-5 py-2 transition-all",
                href === "/scan"
                  ? active
                    ? "bg-amber-400 text-amber-900 shadow-md scale-105"
                    : "bg-amber-100 text-amber-700"
                  : active
                    ? "text-amber-600"
                    : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon
                className={cn(
                  "h-6 w-6 transition-transform",
                  href === "/scan" ? "h-7 w-7" : "",
                  active && href === "/scan" ? "scale-110" : ""
                )}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span
                className={cn(
                  "text-[10px] font-medium leading-none",
                  href === "/scan" ? "text-[11px]" : ""
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
