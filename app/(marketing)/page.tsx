"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { lira, type Kurus } from "@/kit/money";
import { days, money, moneyRound } from "@/kit/display";
import { fromGross } from "@/engine/makbuz/receipt";
import { arguments_, figures } from "@/words/site";
import { landing, receipt as receiptWords } from "@/words/ui";
import { collected, medianLag, totals } from "@/records/book";
import { Figure, LeaderLine, Note, Sheet } from "@/paper/parts/marks";
import { useLanguage } from "@/paper/parts/language";

/**
 * The three figures in the header are computed from the demo book by the same
 * functions the product uses, and the receipt below is the real `fromGross`.
 * Nothing on this page is a number typed into the copy.
 */
export default function LandingPage() {
  const { language, say } = useLanguage();
  const [gross, setGross] = useState<Kurus>(lira(50_000));
  const document = fromGross(gross);

  return (
    <>
      <section className="mx-auto max-w-[1080px] px-5 pt-16 pb-14 lg:px-8">
        <p className="field">{say(landing.eyebrow)}</p>
        <h1 className="mt-4 max-w-[18ch] font-serif text-5xl leading-[1.05] text-ink sm:text-6xl">
          {say({
            tr: "Kuruşu kuruşuna, dilimi dilimine.",
            en: "To the kuruş, and band by band.",
          })}
        </h1>
        <p className="mt-5 max-w-[62ch] text-[15px] leading-relaxed text-ink-2">
          {say(landing.lead)}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/ledger"
            className="inline-flex items-center gap-2 border border-ink bg-ink px-5 py-2.5 text-sm font-semibold text-stock transition-colors hover:border-plum hover:bg-plum"
          >
            {say(landing.ctaPrimary)}
            <ArrowRight className="size-4" strokeWidth={2.2} />
          </Link>
          <a
            href="#decisions"
            className="border border-rule-2 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-tint"
          >
            {say(landing.ctaSecondary)}
          </a>
        </div>

        <dl className="mt-12 grid gap-px border border-rule bg-rule sm:grid-cols-3">
          <div className="bg-sheet px-5 py-4">
            <Figure
              label={say(figures.collected.label)}
              value={moneyRound(collected, language)}
              note={say(figures.collected.note)}
            />
          </div>
          <div className="bg-sheet px-5 py-4">
            <Figure
              label={say(figures.withheld.label)}
              value={moneyRound(totals.stopaj, language)}
              note={say(figures.withheld.note)}
              tone="plum"
            />
          </div>
          <div className="bg-sheet px-5 py-4">
            <Figure
              label={say(figures.lag.label)}
              value={days(Math.round(medianLag), language)}
              note={say(figures.lag.note)}
              tone="flag"
            />
          </div>
        </dl>
      </section>

      <section className="border-y border-rule bg-sheet">
        <div className="mx-auto grid max-w-[1080px] gap-10 px-5 py-14 lg:grid-cols-[1fr_minmax(0,380px)] lg:px-8">
          <div>
            <h2 className="font-serif text-3xl text-ink">{say(landing.receiptTitle)}</h2>
            <p className="mt-2 max-w-[58ch] text-[13.5px] leading-relaxed text-ink-2">
              {say(landing.receiptLead)}
            </p>
            <label className="mt-6 block max-w-sm">
              <span className="field">{say(landing.grossLabel)}</span>
              <input
                type="range"
                min={lira(5_000)}
                max={lira(250_000)}
                step={lira(1_000)}
                value={gross}
                onChange={(event) => setGross(Number(event.target.value))}
                className="mt-2 block w-full accent-[var(--color-plum)]"
              />
              <span className="figures mt-1 block font-serif text-2xl text-ink">
                {money(gross, language)}
              </span>
            </label>
            <div className="mt-6 max-w-[58ch]">
              <Note>{say(receiptWords.note)}</Note>
            </div>
          </div>

          <Sheet className="self-start p-6">
            <p className="field font-type">2026 / 000</p>
            <div className="mt-4 space-y-2">
              <LeaderLine label={say(receiptWords.brut)} value={money(document.brut, language)} />
              <LeaderLine
                label={say(receiptWords.stopaj)}
                value={`-${money(document.stopaj, language)}`}
              />
              <LeaderLine label={say(receiptWords.net)} value={money(document.net, language)} />
              <LeaderLine
                label={say(receiptWords.kdv)}
                value={`+${money(document.kdv, language)}`}
              />
              <div className="border-t border-ink pt-2">
                <LeaderLine
                  strong
                  label={say(receiptWords.tahsil)}
                  value={money(document.tahsil, language)}
                  tone="plum"
                />
              </div>
            </div>
          </Sheet>
        </div>
      </section>

      <section id="decisions" className="mx-auto max-w-[1080px] px-5 py-14 lg:px-8">
        <h2 className="font-serif text-3xl text-ink">{say(landing.argumentsTitle)}</h2>
        <div className="mt-8 grid gap-x-10 gap-y-9 sm:grid-cols-2">
          {arguments_.map((item) => (
            <article key={item.mark}>
              <p className="font-type text-xs text-plum">{item.mark}</p>
              <h3 className="mt-1.5 font-serif text-xl leading-snug text-ink">
                {say(item.title)}
              </h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-2">{say(item.body)}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
