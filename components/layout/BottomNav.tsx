"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { demoEvent } from "@/lib/demo/events";

type NavItem = {
  label: string;
  href: string;
  match: (pathname: string) => boolean;
  icon: string;
};

const base = `/events/${demoEvent.slug}`;

const items: NavItem[] = [
  {
    label: "Event",
    href: base,
    match: (p) => p === base,
    icon: "M3 11l9-8 9 8M5 10v10h14V10",
  },
  {
    label: "Strategies",
    href: `${base}/strategies`,
    match: (p) => p.startsWith(`${base}/strategies`),
    icon: "M4 6h16M4 12h16M4 18h10",
  },
  {
    label: "Booths",
    href: `${base}/booths`,
    match: (p) => p.startsWith(`${base}/booths`),
    icon: "M3 9l1-5h16l1 5M5 9v11h14V9M9 13h6",
  },
  {
    label: "Checklist",
    href: `${base}/checklist`,
    match: (p) => p.startsWith(`${base}/checklist`),
    icon: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  },
  {
    label: "Profile",
    href: `${base}/profile`,
    match: (p) => p.startsWith(`${base}/profile`),
    icon: "M16 21v-2a4 4 0 00-8 0v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  },
];

export function BottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex w-full max-w-md items-stretch justify-between">
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.label} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                  active ? "text-cyan-700" : "text-zinc-500"
                }`}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={active ? 2.4 : 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d={item.icon} />
                </svg>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
