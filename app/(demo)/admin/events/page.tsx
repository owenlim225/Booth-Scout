import { AppShell } from "@/components/layout/AppShell";
import { AdminNav } from "@/components/admin/AdminNav";
import { Badge } from "@/components/ui/Badge";
import { demoEvent } from "@/lib/demo/events";

function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: demoEvent.timezone,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const rowClass = "flex flex-col gap-1 rounded-xl border border-zinc-200 p-3";
const labelClass = "text-xs font-semibold uppercase tracking-wide text-zinc-500";

export default function AdminEventsPage() {
  return (
    <AppShell
      title="Event"
      subtitle="Admin · event info"
      backHref={`/events/${demoEvent.slug}`}
    >
      <AdminNav />
      <div className="space-y-2">
        <div className={rowClass}>
          <span className={labelClass}>Name</span>
          <span className="text-base font-semibold break-words">{demoEvent.name}</span>
        </div>
        <div className={rowClass}>
          <span className={labelClass}>Status</span>
          <span>
            <Badge tone={demoEvent.status === "live" ? "fresh" : "neutral"}>
              {demoEvent.status}
            </Badge>
          </span>
        </div>
        <div className={rowClass}>
          <span className={labelClass}>Venue</span>
          <span className="text-sm break-words">{demoEvent.venue}</span>
        </div>
        <div className={rowClass}>
          <span className={labelClass}>City</span>
          <span className="text-sm break-words">{demoEvent.city}</span>
        </div>
        <div className={rowClass}>
          <span className={labelClass}>Starts</span>
          <span className="text-sm break-words">{formatDateTime(demoEvent.startsAt)}</span>
        </div>
        <div className={rowClass}>
          <span className={labelClass}>Ends</span>
          <span className="text-sm break-words">{formatDateTime(demoEvent.endsAt)}</span>
        </div>
        <div className={rowClass}>
          <span className={labelClass}>Description</span>
          <span className="text-sm break-words">{demoEvent.description}</span>
        </div>
      </div>
    </AppShell>
  );
}
