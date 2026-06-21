import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { CreateStrategyForm } from "@/components/create/CreateStrategyForm";
import { demoEvent } from "@/lib/demo/events";

type Params = Promise<{ slug: string }>;

export default async function CreateStrategyPage({ params }: { params: Params }) {
  const { slug } = await params;
  if (slug !== demoEvent.slug) {
    notFound();
  }

  return (
    <AppShell
      title="Create Strategy"
      subtitle={demoEvent.name}
      backHref={`/events/${slug}/profile`}
    >
      <CreateStrategyForm eventSlug={slug} />
    </AppShell>
  );
}
