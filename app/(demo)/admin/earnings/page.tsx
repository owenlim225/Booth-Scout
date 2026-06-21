import { AppShell } from "@/components/layout/AppShell";
import { AdminNav } from "@/components/admin/AdminNav";
import { demoEvent } from "@/lib/demo/events";
import { getPublishedStrategies } from "@/lib/demo/strategies";

const PLATFORM_FEE_BPS = 500;
const FEE_RATE = PLATFORM_FEE_BPS / 10_000;

function formatAmount(value: number): string {
  return value.toFixed(2);
}

export default function AdminEarningsPage() {
  const paidStrategies = getPublishedStrategies().filter(
    (strategy) => strategy.visibility === "paid"
  );

  const rows = paidStrategies.map((strategy) => {
    const platformFee = strategy.priceAmount * FEE_RATE;
    const strategistShare = strategy.priceAmount - platformFee;
    return {
      id: strategy.id,
      title: strategy.title,
      asset: strategy.priceAsset,
      price: strategy.priceAmount,
      platformFee,
      strategistShare,
    };
  });

  const totalPlatform = rows.reduce((sum, row) => sum + row.platformFee, 0);

  return (
    <AppShell
      title="Earnings"
      subtitle="Admin · demo figures"
      backHref={`/events/${demoEvent.slug}`}
    >
      <AdminNav />
      <div className="rounded-2xl border border-zinc-200 p-4 text-center">
        <p className="text-2xl font-semibold">{formatAmount(totalPlatform)}</p>
        <p className="text-xs text-zinc-600">Total platform earnings (demo, 1 unlock each)</p>
      </div>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.id} className="space-y-2 rounded-xl border border-zinc-200 p-3">
            <p className="text-base font-semibold break-words">{row.title}</p>
            <dl className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <dt className="text-xs text-zinc-500">Price</dt>
                <dd className="font-medium">
                  {formatAmount(row.price)} {row.asset}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Platform 5%</dt>
                <dd className="font-medium">{formatAmount(row.platformFee)}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Strategist 95%</dt>
                <dd className="font-medium">{formatAmount(row.strategistShare)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      {rows.length === 0 ? (
        <p className="text-sm text-zinc-600">No paid strategies yet.</p>
      ) : null}
      <p className="rounded-xl bg-zinc-100 px-3 py-2 text-xs text-zinc-600 break-words">
        Demo figures derived from the Soroban contract&rsquo;s 500 bps (5%) platform fee, assuming
        one unlock per paid strategy.
      </p>
    </AppShell>
  );
}
