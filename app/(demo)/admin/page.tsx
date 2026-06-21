import { AppShell } from "@/components/layout/AppShell";
import { AdminNav } from "@/components/admin/AdminNav";
import { demoEvent } from "@/lib/demo/events";
import { demoBooths } from "@/lib/demo/booths";
import { getPublishedStrategies } from "@/lib/demo/strategies";
import { demoSwagOffers } from "@/lib/demo/swag";

const cardClass = "rounded-2xl border border-zinc-200 p-4";

export default function AdminPage() {
  const publishedStrategies = getPublishedStrategies();

  const summary: { label: string; value: number }[] = [
    { label: "Booths", value: demoBooths.length },
    { label: "Published strategies", value: publishedStrategies.length },
    { label: "Swag offers", value: demoSwagOffers.length },
  ];

  return (
    <AppShell
      title="Admin"
      subtitle="Platform admin"
      backHref={`/events/${demoEvent.slug}`}
    >
      <AdminNav />
      <div className="grid grid-cols-3 gap-2">
        {summary.map((item) => (
          <div key={item.label} className={`${cardClass} text-center`}>
            <p className="text-2xl font-semibold">{item.value}</p>
            <p className="text-xs text-zinc-600 break-words">{item.label}</p>
          </div>
        ))}
      </div>
      <p className="rounded-xl bg-zinc-100 px-3 py-2 text-sm text-zinc-700 break-words">
        For MVP, only platform admins create events.
      </p>
    </AppShell>
  );
}
