import { cn } from "@/kit/cn";
import { product } from "@/words/site";

/**
 * The mark is a bound ledger seen edge-on: a dark cover, a plum spine, and
 * three ruled lines. Flat geometry, no gradient, so it stays readable at the
 * 16 pixels a browser tab gives it.
 */
export function Mark({ className, nameless = false }: { className?: string; nameless?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 28 28" className="size-6 shrink-0" aria-hidden>
        <rect width="28" height="28" rx="2" className="fill-ink" />
        <rect x="6" y="5" width="16" height="18" rx="1" className="fill-sheet" />
        <rect x="6" y="5" width="3.2" height="18" className="fill-plum" />
        <rect x="11.5" y="9" width="8" height="1.4" className="fill-ink" />
        <rect x="11.5" y="13" width="8" height="1.4" className="fill-rule-2" />
        <rect x="11.5" y="17" width="5" height="1.4" className="fill-rule-2" />
      </svg>
      {nameless ? null : (
        <span className="font-serif text-xl leading-none font-semibold tracking-tight">
          {product.name}
        </span>
      )}
    </span>
  );
}
