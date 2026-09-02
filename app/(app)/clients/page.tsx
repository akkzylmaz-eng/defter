"use client";

import { day, days, money, moneyRound, percent } from "@/kit/display";
import { share } from "@/kit/money";
import type { Client } from "@/engine/clients/book";
import { clients as words } from "@/words/ui";
import { book, spread } from "@/records/book";
import { Bar, Figure, Note, Sheet, SheetHead, Tag, type Tone } from "@/paper/parts/marks";
import { Page } from "@/paper/frame/masthead";
import { useLanguage } from "@/paper/parts/language";

const RISK_TONE = { low: "credit", watch: "flag", high: "debit" } as const;

export default function ClientsPage() {
  const { language, say } = useLanguage();
  const invoicedTotal = book.reduce((total, standing) => total + standing.invoiced, 0);

  const kindLabel = (kind: Client["kind"]) =>
    say(
      kind === "company"
        ? words.kindCompany
        : kind === "individual"
          ? words.kindIndividual
          : words.kindAbroad,
    );

  return (
    <Page title={say(words.title)} lead={say(words.lead)}>
      <Sheet>
        <SheetHead
          title={say(words.concentrationTitle)}
          aside={
            <Tag tone={RISK_TONE[spread.risk] as Tone}>
              {say(
                spread.risk === "high"
                  ? words.riskHigh
                  : spread.risk === "watch"
                    ? words.riskWatch
                    : words.riskLow,
              )}
            </Tag>
          }
        />
        <div className="grid gap-6 px-5 py-5 md:grid-cols-[auto_auto_1fr]">
          <Figure
            label={say(words.topShare)}
            value={percent(spread.topShare, language)}
            note={spread.topClient?.name}
            tone="plum"
            size="lg"
          />
          <Figure
            label={say(words.hhi)}
            value={spread.hhi.toFixed(2).replace(".", language === "tr" ? "," : ".")}
            size="lg"
          />
          <div className="self-center">
            <Note>{say(words.hhiNote)}</Note>
          </div>
        </div>
      </Sheet>

      <div className="grid gap-5 md:grid-cols-2">
        {book.map((standing) => {
          const pays = standing.lagDays;
          return (
            <Sheet key={standing.client.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-serif text-lg leading-tight text-ink">
                    {standing.client.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-ink-3">
                    {kindLabel(standing.client.kind)} · {day(standing.client.since, language)}
                  </p>
                </div>
                <span className="figures shrink-0 text-right">
                  <span className="field block">{say(words.invoiced)}</span>
                  <span className="font-serif text-xl text-ink">
                    {moneyRound(standing.invoiced, language)}
                  </span>
                </span>
              </div>

              <div className="mt-3.5 flex items-center gap-2">
                <Bar
                  value={share(standing.invoiced, invoicedTotal)}
                  tone={standing.client.id === spread.topClient?.id ? "plum" : "ink"}
                />
                <span className="figures w-12 shrink-0 text-right text-xs text-ink-2">
                  {percent(share(standing.invoiced, invoicedTotal), language)}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-rule pt-3.5 text-xs">
                <div>
                  <dt className="field">{say(words.collected)}</dt>
                  <dd className="figures mt-0.5 text-ink">
                    {money(standing.collected, language)}
                  </dd>
                </div>
                <div>
                  <dt className="field">{say(words.outstanding)}</dt>
                  <dd
                    className={`figures mt-0.5 ${standing.outstanding > 0 ? "text-flag" : "text-ink-3"}`}
                  >
                    {standing.outstanding === 0 ? "-" : money(standing.outstanding, language)}
                  </dd>
                </div>
                <div>
                  <dt className="field">{say(words.lag)}</dt>
                  <dd className="figures mt-0.5">
                    {standing.invoices === 0 || standing.collected === 0 ? (
                      <span className="text-ink-3">{say(words.noHistory)}</span>
                    ) : pays > 0 ? (
                      <span className="text-debit">+{days(pays, language)}</span>
                    ) : pays < 0 ? (
                      <span className="text-credit">
                        {days(Math.abs(pays), language)} {say(words.early)}
                      </span>
                    ) : (
                      <span className="text-credit">{say(words.onTime)}</span>
                    )}
                  </dd>
                </div>
              </dl>

              <p className="mt-3.5 text-[13px] leading-relaxed text-ink-2">
                {say(standing.client.note)}
              </p>
            </Sheet>
          );
        })}
      </div>
    </Page>
  );
}
