import type { ReactNode } from "react";
import { cn } from "@/kit/cn";

/**
 * The page vocabulary. A ledger is set with rules and space, not with cards,
 * so there is no shadowed box component here on purpose. A `Sheet` is a white
 * rectangle with a hairline; everything else is type and alignment.
 */

export function Sheet({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("border border-rule bg-sheet", className)}>{children}</section>
  );
}

export function SheetHead({
  title,
  lead,
  aside,
}: {
  title: string;
  lead?: string;
  aside?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-6 border-b border-rule px-5 py-4">
      <div className="min-w-0">
        <h2 className="font-serif text-xl leading-tight text-ink">{title}</h2>
        {lead ? (
          <p className="mt-1.5 max-w-[70ch] text-[13px] leading-relaxed text-ink-2">{lead}</p>
        ) : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </header>
  );
}

export type Tone = "ink" | "plum" | "credit" | "debit" | "flag";

const FIGURE_TONE: Record<Tone, string> = {
  ink: "text-ink",
  plum: "text-plum",
  credit: "text-credit",
  debit: "text-debit",
  flag: "text-flag",
};

/** A labelled figure. The whole app is built out of these. */
export function Figure({
  label,
  value,
  note,
  tone = "ink",
  size = "md",
}: {
  label: string;
  value: string;
  note?: string;
  tone?: Tone;
  size?: "md" | "lg";
}) {
  return (
    <div>
      <p className="field">{label}</p>
      <p
        className={cn(
          "figures mt-1.5 font-serif leading-none",
          size === "lg" ? "text-[2.125rem]" : "text-2xl",
          FIGURE_TONE[tone],
        )}
      >
        {value}
      </p>
      {note ? <p className="mt-1.5 text-xs leading-relaxed text-ink-3">{note}</p> : null}
    </div>
  );
}

/** A row of figures separated by vertical rules, as on a statement header. */
export function FigureRow({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-px border border-rule bg-rule sm:grid-cols-4">
      {children}
    </div>
  );
}

export function FigureCell({ children }: { children: ReactNode }) {
  return <div className="bg-sheet px-5 py-4">{children}</div>;
}

const PILL_TONE: Record<Tone, string> = {
  ink: "border-rule-2 text-ink-2",
  plum: "border-plum/30 bg-plum-soft text-plum",
  credit: "border-credit/25 bg-credit-soft text-credit",
  debit: "border-debit/25 bg-debit-soft text-debit",
  flag: "border-flag/25 bg-flag-soft text-flag",
};

export function Tag({
  tone = "ink",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border px-1.5 py-0.5 text-[11px] font-semibold",
        PILL_TONE[tone],
      )}
    >
      {children}
    </span>
  );
}

/** A label and a figure with printed leader dots between them. */
export function LeaderLine({
  label,
  value,
  strong = false,
  tone = "ink",
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: Tone;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className={cn("shrink-0 text-[13px]", strong ? "font-semibold text-ink" : "text-ink-2")}>
        {label}
      </span>
      <span className="leader h-3 min-w-4 flex-1" aria-hidden />
      <span
        className={cn(
          "figures shrink-0 text-[13px] tabular-nums",
          strong ? "font-semibold" : "",
          FIGURE_TONE[tone],
        )}
      >
        {value}
      </span>
    </div>
  );
}

/** A horizontal proportion bar. No axis, no legend: it is read against its label. */
export function Bar({
  value,
  tone = "plum",
  className,
}: {
  value: number;
  tone?: Tone;
  className?: string;
}) {
  const BAR: Record<Tone, string> = {
    ink: "bg-ink",
    plum: "bg-plum",
    credit: "bg-credit",
    debit: "bg-debit",
    flag: "bg-flag",
  };
  return (
    <div className={cn("h-2 w-full bg-tint", className)}>
      <div
        className={cn("h-full", BAR[tone])}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <p className="border-l-2 border-rule-2 bg-tint/60 px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-2">
      {children}
    </p>
  );
}
