import { AppShell } from "@/components/layout/AppShell";
import { AdminNav } from "@/components/admin/AdminNav";
import { Badge } from "@/components/ui/Badge";
import { demoEvent } from "@/lib/demo/events";
import { demoBooths } from "@/lib/demo/booths";

export default function AdminBoothsPage() {
  return (
    <AppShell
      title="Booths"
      subtitle={`${demoBooths.length} booths`}
      backHref={`/events/${demoEvent.slug}`}
    >
      <AdminNav />
      <ul className="space-y-2">
        {demoBooths.map((booth) => (
          <li key={booth.id} className="space-y-2 rounded-xl border border-zinc-200 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-base font-semibold break-words">
                {booth.name} <span className="text-zinc-500">#{booth.boothNumber}</span>
              </span>
              {booth.adminVerified ? <Badge tone="verified">Verified</Badge> : null}
            </div>
            <p className="text-sm text-zinc-700 break-words">{booth.sponsorName}</p>
            <p className="text-xs text-zinc-500 break-words">{booth.category}</p>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
