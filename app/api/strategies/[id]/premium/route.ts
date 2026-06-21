import { getStrategyById } from "@/lib/demo/strategies";
import { simulateHasUnlock, validateStellarAddress } from "@/lib/stellar/contract-client";

type Params = Promise<{ id: string }>;

export async function GET(request: Request, context: { params: Params }) {
  try {
    const { id } = await context.params;
    const strategy = getStrategyById(id);
    if (!strategy || strategy.status !== "published") {
      return Response.json({ error: "Strategy not found" }, { status: 404 });
    }

    // Free strategies expose full content without an unlock.
    if (strategy.visibility === "paid") {
      const buyer = validateStellarAddress(new URL(request.url).searchParams.get("buyer"));
      const contractStrategyId = strategy.contractStrategyId ?? 0;
      const unlocked = await simulateHasUnlock(contractStrategyId, buyer);
      if (!unlocked) {
        return Response.json({ error: "Locked" }, { status: 403 });
      }
    }

    return Response.json({
      premium: {
        fullText: strategy.fullText,
        steps: strategy.steps,
        images: strategy.images,
      },
    });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Invalid request";
    return Response.json({ error: message }, { status: 400 });
  }
}
