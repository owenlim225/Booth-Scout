"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { track } from "@/lib/analytics";
import { demoBooths } from "@/lib/demo/booths";
import { saveLocalStrategy } from "@/lib/storage/community-store";
import { useWallet } from "@/lib/hooks/useWallet";
import type {
  PriceAsset,
  RatingLevel,
  Strategy,
  StrategyImage,
  StrategyStep,
  Visibility,
} from "@/types/demo";

type Props = { eventSlug: string };

const TOTAL_STEPS = 9;

const ATTESTATION_LABEL =
  "I confirm this strategy follows event and booth rules and does not encourage bypassing requirements, hoarding, harassment, or unsafe behavior.";

type DraftImage = { url: string; altText: string };
type DraftStep = {
  boothId: string;
  actionText: string;
  expectedSwag: string;
  rationale: string;
};

const inputClass =
  "w-full min-h-12 rounded-xl border border-zinc-300 px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500";
const textareaClass =
  "w-full min-h-24 rounded-xl border border-zinc-300 px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500";
const labelClass = "block text-sm font-medium text-zinc-800";
const navButtonClass =
  "inline-flex min-h-12 flex-1 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500";

function boothName(boothId: string): string {
  return demoBooths.find((booth) => booth.id === boothId)?.name ?? "Unknown booth";
}

function shortAddress(address: string): string {
  if (address.length <= 10) {
    return address;
  }
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function CreateStrategyForm({ eventSlug }: Props) {
  const wallet = useWallet();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("free");
  const [priceAmount, setPriceAmount] = useState("");
  const [priceAsset, setPriceAsset] = useState<PriceAsset>("USDC");
  const [images, setImages] = useState<DraftImage[]>([]);
  const [steps, setSteps] = useState<DraftStep[]>([
    { boothId: demoBooths[0]?.id ?? "", actionText: "", expectedSwag: "", rationale: "" },
  ]);
  const [fallbackNote, setFallbackNote] = useState("");
  const [valueRating, setValueRating] = useState<RatingLevel>("medium");
  const [hassleRating, setHassleRating] = useState<RatingLevel>("medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [attested, setAttested] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const priceValue = Number.parseFloat(priceAmount);
  const computedMinutes = useMemo(() => {
    const parsed = Number.parseInt(estimatedMinutes, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
    return steps.length * 8;
  }, [estimatedMinutes, steps.length]);

  const stepValid = useMemo(() => {
    switch (step) {
      case 1:
        return title.trim().length > 0 && summary.trim().length > 0;
      case 2:
        return true;
      case 3:
        if (visibility === "free") {
          return true;
        }
        return Number.isFinite(priceValue) && priceValue > 0;
      case 4:
        return images.every((image) => image.url.trim().length > 0);
      case 5:
        return (
          steps.length >= 1 &&
          steps.every(
            (item) => item.boothId.trim().length > 0 && item.actionText.trim().length > 0
          )
        );
      case 6:
        return true;
      case 7:
        return attested;
      case 8:
        return true;
      default:
        return true;
    }
  }, [step, title, summary, visibility, priceValue, images, steps, attested]);

  const goNext = () => {
    if (!stepValid) {
      return;
    }
    setStep((current) => {
      let next = current + 1;
      if (next === 3 && visibility === "free") {
        next = 4;
      }
      return Math.min(next, TOTAL_STEPS);
    });
  };

  const goBack = () => {
    setStep((current) => {
      let prev = current - 1;
      if (prev === 3 && visibility === "free") {
        prev = 2;
      }
      return Math.max(prev, 1);
    });
  };

  const addImage = () => setImages((prev) => [...prev, { url: "", altText: "" }]);
  const removeImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));
  const updateImage = (index: number, patch: Partial<DraftImage>) =>
    setImages((prev) => prev.map((image, i) => (i === index ? { ...image, ...patch } : image)));

  const addStep = () =>
    setSteps((prev) => [
      ...prev,
      { boothId: demoBooths[0]?.id ?? "", actionText: "", expectedSwag: "", rationale: "" },
    ]);
  const removeStep = (index: number) =>
    setSteps((prev) => prev.filter((_, i) => i !== index));
  const updateStep = (index: number, patch: Partial<DraftStep>) =>
    setSteps((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const moveStep = (index: number, direction: -1 | 1) =>
    setSteps((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });

  const handlePublish = async () => {
    if (!attested || submitting) {
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const now = new Date().toISOString();
      const orderedImages: StrategyImage[] = images
        .filter((image) => image.url.trim().length > 0)
        .map((image, index) => ({
          url: image.url.trim(),
          altText: image.altText.trim(),
          position: index,
        }));
      const mappedSteps: StrategyStep[] = steps.map((item, index) => ({
        order: index + 1,
        boothId: item.boothId,
        actionText: item.actionText.trim(),
        rationale: item.rationale.trim(),
        expectedSwag: item.expectedSwag.trim(),
        fallbackIfLineLong: fallbackNote.trim(),
      }));
      const fullText = [
        summary.trim(),
        "",
        ...mappedSteps.map(
          (item) => `${item.order}. ${boothName(item.boothId)} — ${item.actionText}`
        ),
      ].join("\n");
      const strategy: Strategy = {
        id: `local-${crypto.randomUUID()}`,
        eventSlug,
        creatorName: wallet.address ? shortAddress(wallet.address) : "You",
        creatorAddress: wallet.address ?? undefined,
        title: title.trim(),
        summary: summary.trim(),
        fullText,
        visibility,
        priceAmount: visibility === "paid" && Number.isFinite(priceValue) ? priceValue : 0,
        priceAsset,
        status: "published",
        followsRulesAttested: true,
        estimatedMinutes: computedMinutes,
        valueRating,
        hassleRating,
        likesCount: 0,
        dislikesCount: 0,
        commentsCount: 0,
        publishedAt: now,
        updatedAt: now,
        previewSteps: mappedSteps.slice(0, 2).map((item) => boothName(item.boothId)),
        steps: mappedSteps,
        images: orderedImages,
      };
      await saveLocalStrategy(strategy);
      await track("strategy_created", { strategyId: strategy.id, visibility });
      await track("strategy_published", { strategyId: strategy.id, visibility });
      setPublished(true);
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : "Could not publish strategy.");
    } finally {
      setSubmitting(false);
    }
  };

  if (published) {
    return (
      <section className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <h2 className="text-lg font-semibold text-emerald-900">Strategy published</h2>
        <p className="text-sm text-emerald-800 break-words">
          &ldquo;{title.trim()}&rdquo; is saved to your device and listed for this event.
        </p>
        <div className="flex flex-col gap-2">
          <Link
            href={`/events/${eventSlug}/profile`}
            className={`${navButtonClass} border border-emerald-300 bg-white text-emerald-900`}
          >
            Back to profile
          </Link>
          <Link
            href="/admin/strategies"
            className={`${navButtonClass} bg-emerald-600 text-white`}
          >
            View in admin strategies
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-600">
          Step {step} of {TOTAL_STEPS}
        </p>
        <Badge tone={visibility === "paid" ? "paid" : "free"}>
          {visibility === "paid" ? "Paid" : "Free"}
        </Badge>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
        <div
          className="h-full rounded-full bg-cyan-500 transition-all"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      {step === 1 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Title &amp; summary</h2>
          <label className={labelClass} htmlFor="strategy-title">
            Title
          </label>
          <input
            id="strategy-title"
            className={inputClass}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="High-Value Swag Route"
          />
          <label className={labelClass} htmlFor="strategy-summary">
            Summary
          </label>
          <textarea
            id="strategy-summary"
            className={textareaClass}
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="A short hook describing your route."
          />
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Free or paid?</h2>
          <div className="grid grid-cols-2 gap-2">
            {(["free", "paid"] as Visibility[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setVisibility(option)}
                className={`min-h-12 rounded-xl border px-3 py-2 text-sm font-semibold capitalize ${
                  visibility === option
                    ? "border-cyan-500 bg-cyan-50 text-cyan-900"
                    : "border-zinc-300 bg-white text-zinc-700"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <p className="text-sm text-zinc-600 break-words">
            Paid strategies unlock on the Stellar testnet for the price you set.
          </p>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Pricing</h2>
          {visibility === "free" ? (
            <p className="text-sm text-zinc-600">Free strategy — no pricing needed.</p>
          ) : (
            <>
              <label className={labelClass} htmlFor="strategy-price">
                Price amount
              </label>
              <input
                id="strategy-price"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                className={inputClass}
                value={priceAmount}
                onChange={(event) => setPriceAmount(event.target.value)}
                placeholder="2"
              />
              <span className={labelClass}>Asset</span>
              <div className="grid grid-cols-2 gap-2">
                {(["USDC", "XLM"] as PriceAsset[]).map((asset) => (
                  <button
                    key={asset}
                    type="button"
                    onClick={() => setPriceAsset(asset)}
                    className={`min-h-12 rounded-xl border px-3 py-2 text-sm font-semibold ${
                      priceAsset === asset
                        ? "border-cyan-500 bg-cyan-50 text-cyan-900"
                        : "border-zinc-300 bg-white text-zinc-700"
                    }`}
                  >
                    {asset}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Images (optional)</h2>
          {images.length === 0 ? (
            <p className="text-sm text-zinc-600">No images added yet.</p>
          ) : null}
          {images.map((image, index) => (
            <div key={index} className="space-y-2 rounded-xl border border-zinc-200 p-3">
              <label className={labelClass} htmlFor={`image-url-${index}`}>
                Image URL
              </label>
              <input
                id={`image-url-${index}`}
                className={inputClass}
                value={image.url}
                onChange={(event) => updateImage(index, { url: event.target.value })}
                placeholder="https://…"
              />
              <label className={labelClass} htmlFor={`image-alt-${index}`}>
                Alt text
              </label>
              <input
                id={`image-alt-${index}`}
                className={inputClass}
                value={image.altText}
                onChange={(event) => updateImage(index, { altText: event.target.value })}
                placeholder="Describe the image"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="min-h-12 w-full rounded-xl border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700"
              >
                Remove image
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addImage}
            className="min-h-12 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm font-semibold"
          >
            + Add image
          </button>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Booth steps</h2>
          <p className="text-sm text-zinc-600">Add at least one ordered booth stop.</p>
          {steps.map((item, index) => (
            <div key={index} className="space-y-2 rounded-xl border border-zinc-200 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-700">Step {index + 1}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveStep(index, -1)}
                    disabled={index === 0}
                    className="min-h-11 min-w-11 rounded-lg border border-zinc-300 px-2 text-sm disabled:opacity-40"
                    aria-label="Move step up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(index, 1)}
                    disabled={index === steps.length - 1}
                    className="min-h-11 min-w-11 rounded-lg border border-zinc-300 px-2 text-sm disabled:opacity-40"
                    aria-label="Move step down"
                  >
                    ↓
                  </button>
                </div>
              </div>
              <label className={labelClass} htmlFor={`step-booth-${index}`}>
                Booth
              </label>
              <select
                id={`step-booth-${index}`}
                className={inputClass}
                value={item.boothId}
                onChange={(event) => updateStep(index, { boothId: event.target.value })}
              >
                {demoBooths.map((booth) => (
                  <option key={booth.id} value={booth.id}>
                    {booth.name} (#{booth.boothNumber})
                  </option>
                ))}
              </select>
              <label className={labelClass} htmlFor={`step-action-${index}`}>
                Action
              </label>
              <textarea
                id={`step-action-${index}`}
                className={textareaClass}
                value={item.actionText}
                onChange={(event) => updateStep(index, { actionText: event.target.value })}
                placeholder="What to do at this booth."
              />
              <label className={labelClass} htmlFor={`step-swag-${index}`}>
                Expected swag
              </label>
              <input
                id={`step-swag-${index}`}
                className={inputClass}
                value={item.expectedSwag}
                onChange={(event) => updateStep(index, { expectedSwag: event.target.value })}
                placeholder="Sticker pack"
              />
              <label className={labelClass} htmlFor={`step-rationale-${index}`}>
                Rationale (optional)
              </label>
              <input
                id={`step-rationale-${index}`}
                className={inputClass}
                value={item.rationale}
                onChange={(event) => updateStep(index, { rationale: event.target.value })}
                placeholder="Why this order works."
              />
              <button
                type="button"
                onClick={() => removeStep(index)}
                disabled={steps.length === 1}
                className="min-h-12 w-full rounded-xl border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 disabled:opacity-40"
              >
                Remove step
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addStep}
            className="min-h-12 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm font-semibold"
          >
            + Add step
          </button>
        </div>
      ) : null}

      {step === 6 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Fallback notes</h2>
          <p className="text-sm text-zinc-600 break-words">
            One note applied to every step for when a booth line is long.
          </p>
          <textarea
            className={textareaClass}
            value={fallbackNote}
            onChange={(event) => setFallbackNote(event.target.value)}
            placeholder="If the line is long, skip ahead and return after lunch."
          />
        </div>
      ) : null}

      {step === 7 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Rule attestation</h2>
          <label className="flex items-start gap-3 rounded-xl border border-zinc-200 p-3">
            <input
              type="checkbox"
              checked={attested}
              onChange={(event) => setAttested(event.target.checked)}
              className="mt-1 h-5 w-5 shrink-0"
            />
            <span className="text-sm text-zinc-800 break-words">{ATTESTATION_LABEL}</span>
          </label>
          {!attested ? (
            <p className="text-sm text-rose-700">You must confirm this to publish.</p>
          ) : null}
        </div>
      ) : null}

      {step === 8 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Preview</h2>
          <div className="space-y-3 rounded-2xl border border-zinc-200 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold break-words">{title.trim() || "Untitled"}</h3>
              <Badge tone={visibility === "paid" ? "paid" : "free"}>
                {visibility === "paid"
                  ? `${Number.isFinite(priceValue) ? priceValue : 0} ${priceAsset}`
                  : "Free"}
              </Badge>
            </div>
            <p className="text-sm text-zinc-700 break-words">{summary.trim()}</p>
            <ol className="space-y-1 text-sm text-zinc-800">
              {steps.map((item, index) => (
                <li key={index} className="break-words">
                  {index + 1}. {boothName(item.boothId)}
                  {item.actionText.trim() ? ` — ${item.actionText.trim()}` : ""}
                </li>
              ))}
            </ol>
            <p className="text-sm text-zinc-600">
              Attestation: {attested ? "confirmed" : "not confirmed"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass} htmlFor="value-rating">
                Value
              </label>
              <select
                id="value-rating"
                className={inputClass}
                value={valueRating}
                onChange={(event) => setValueRating(event.target.value as RatingLevel)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="hassle-rating">
                Hassle
              </label>
              <select
                id="hassle-rating"
                className={inputClass}
                value={hassleRating}
                onChange={(event) => setHassleRating(event.target.value as RatingLevel)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <label className={labelClass} htmlFor="estimated-minutes">
            Estimated minutes (optional)
          </label>
          <input
            id="estimated-minutes"
            type="number"
            min="0"
            inputMode="numeric"
            className={inputClass}
            value={estimatedMinutes}
            onChange={(event) => setEstimatedMinutes(event.target.value)}
            placeholder={`${steps.length * 8}`}
          />
        </div>
      ) : null}

      {step === 9 ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Publish</h2>
          <p className="text-sm text-zinc-600 break-words">
            Publishing saves this strategy to your device for the {eventSlug} event.
          </p>
          {!attested ? (
            <p className="text-sm text-rose-700">Confirm the rule attestation on step 7 first.</p>
          ) : null}
          {submitError ? (
            <p className="rounded-xl bg-rose-100 px-3 py-2 text-sm text-rose-800">{submitError}</p>
          ) : null}
          <button
            type="button"
            onClick={handlePublish}
            disabled={!attested || submitting}
            className={`${navButtonClass} w-full bg-cyan-600 text-white disabled:opacity-40`}
          >
            {submitting ? "Publishing…" : "Publish strategy"}
          </button>
        </div>
      ) : null}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 1}
          className={`${navButtonClass} border border-zinc-300 bg-white text-zinc-800 disabled:opacity-40`}
        >
          Back
        </button>
        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!stepValid}
            className={`${navButtonClass} bg-zinc-900 text-white disabled:opacity-40`}
          >
            Next
          </button>
        ) : null}
      </div>
    </section>
  );
}
