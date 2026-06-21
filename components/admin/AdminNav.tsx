import Link from "next/link";

const links: { href: string; label: string }[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/events", label: "Event" },
  { href: "/admin/booths", label: "Booths" },
  { href: "/admin/strategies", label: "Strategies" },
  { href: "/admin/moderation", label: "Moderation" },
  { href: "/admin/earnings", label: "Earnings" },
];

export function AdminNav() {
  return (
    <nav aria-label="Admin sections" className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="inline-flex min-h-11 items-center rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
