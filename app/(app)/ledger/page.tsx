"use client";

import Link from "next/link";
import { day, money, moneyRound, percent, rate } from "@/kit/display";
import { share } from "@/kit/money";
import { STATE_LABEL } from "@/engine/invoices/types";
import { daysOverdue, receiptOf, stateOf } from "@/engine/invoices/ledger";
import { bucket, clients as clientWords, ledger, nav } from "@/words/ui";
import {
  ageRows,
  book,
  collected,
  interestAccrued,
  issued,
  owed,
  spread,
  totals,
  yearToDate,
} from "@/records/book";
import { TODAY } from "@/records/workspace";
import { clients } from "@/records/clients";
import {
  Bar,
  Figure,
  FigureCell,
  FigureRow,
  LeaderLine,
  Sheet,
  SheetHead,
  Tag,
  type Tone,
} from "@/paper/parts/marks";
import { Page } from "@/paper/frame/masthead";
import { useLanguage } from "@/paper/parts/language";

/** State to the one colour it is allowed to be, everywhere in the app. */
const STATE_TONE = {
  draft: "ink",
  outstanding: "ink",
  overdue: "debit",
  paid: "credit",
  "paid-late": "flag",
} as const satisfies Record<string, Tone>;

const RISK_TONE = { low: "credit", watch: "flag", high: "debit" } as const;

export default function LedgerPage() {
  const { language, say } = useLanguage();
  const recent = [...issued].sort((a, b) => b.issuedOn.localeCompare(a.issuedOn)).slice(0, 6);
  const widest = Math.max(...ageRows.map((row) => row.amount), 1);

  return (
    <Page title={say(ledger.title)} lead={say(ledger.lead)}>
      <FigureRow>
        <FigureCell>
          <Figure label={say(ledger.invoiced)} value={moneyRound(totals.brut, language)} />
        </FigureCell>
        <FigureCell>
          <Figure
            label={say(ledger.collected)}
            value={moneyRound(collected, language)}
            tone="credit"
          />
        </FigureCell>
        <FigureCell>
          <Figure
            label={say(ledger.receivable)}
            value={moneyRound(owed, language)}
            tone={owed > 0 ? "flag" : "ink"}
          />
        </FigureCell>
        <FigureCell>
          <Figure
            label={say(ledger.withheld)}
            value={moneyRound(totals.stopaj, language)}
            tone="plum"
          />
        </FigureCell>
      </FigureRow>

      <div className="grid gap-7 lg:grid-cols-[1.15fr_1fr]">
        <Sheet>
          <SheetHead title={say(ledger.balanceTitle)} lead={say(ledger.balanceLead)} />
          <div className="space-y-2.5 px-5 py-5">
            <LeaderLine label={say(ledger.base)} value={money(yearToDate.base, language)} />
            <LeaderLine label={say(ledger.computed)} value={money(yearToDate.tax, language)} />
            <LeaderLine
              label={say(ledger.credits)}
              value={`-${money(yearToDate.credits, language)}`}
              tone="plum"
            />
            <div className="border-t border-ink pt-2.5">
              <LeaderLine
                strong
                label={say(yearToDate.refundable ? ledger.refund : ledger.owed)}
                value={money(Math.abs(yearToDate.balance), language)}
                tone={yearToDate.refundable ? "credit" : "debit"}
              />
            </div>
            <div className="flex gap-6 pt-3">
              <p className="text-xs text-ink-3">
                <span className="field block">{say(ledger.effective)}</span>
                <span className="figures text-ink">{percent(yearToDate.effectiveRate, language)}</span>
              </p>
              <p className="text-xs text-ink-3">
                <span className="field block">{say(ledger.marginal)}</span>
                <span className="figures text-ink">{rate(yearToDate.marginalRate, language)}</span>
              </p>
              <Link
                href="/tax"
                className="ml-auto self-end text-[13px] font-semibold text-plum hover:underline"
              >
                {say(nav.tax)} →
              </Link>
            </div>
          </div>
        </Sheet>

        <div className="space-y-7">
          <Sheet>
            <SheetHead title={say(ledger.ageingTitle)} lead={say(ledger.ageingLead)} />
            <ul className="px-5 py-4">
              {ageRows.map((row) => (
                <li key={row.bucket} className="flex items-center gap-3 py-1.5">
                  <span className="w-28 shrink-0 text-xs text-ink-2">{say(bucket[row.bucket])}</span>
                  <Bar
                    value={(row.amount / widest) * 100}
                    tone={row.bucket === "d90_plus" ? "debit" : row.bucket === "current" ? "ink" : "flag"}
                  />
                  <span className="figures w-28 shrink-0 text-right text-xs text-ink">
                    {row.amount === 0 ? "-" : moneyRound(row.amount, language)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-rule px-5 py-3">
              <LeaderLine
                strong
                label={say(ledger.interestTitle)}
                value={money(interestAccrued, language)}
                tone="debit"
              />
              <p className="mt-2 text-xs leading-relaxed text-ink-3">{say(ledger.interestLead)}</p>
            </div>
          </Sheet>

          <Sheet>
            <SheetHead
              title={say(ledger.clientsTitle)}
              aside={
                <Tag tone={RISK_TONE[spread.risk]}>
                  {say(
                    spread.risk === "high"
                      ? clientWords.riskHigh
                      : spread.risk === "watch"
                        ? clientWords.riskWatch
                        : clientWords.riskLow,
                  )}
                </Tag>
              }
            />
            <ul className="px-5 py-4">
              {book
                .filter((standing) => standing.invoiced > 0)
                .map((standing) => (
                  <li key={standing.client.id} className="flex items-center gap-3 py-1.5">
                    <span className="w-36 shrink-0 truncate text-xs text-ink">
                      {standing.client.name}
                    </span>
                    <Bar
                      value={share(standing.invoiced, totals.tahsil + 1)}
                      tone={standing.client.id === spread.topClient?.id ? "plum" : "ink"}
                    />
                    <span className="figures w-12 shrink-0 text-right text-xs text-ink-2">
                      {percent(share(standing.invoiced, book.reduce((s, e) => s + e.invoiced, 0)), language)}
                    </span>
                  </li>
                ))}
            </ul>
          </Sheet>
        </div>
      </div>

      <Sheet>
        <SheetHead
          title={say(ledger.recent)}
          aside={
            <Link href="/invoices" className="text-[13px] font-semibold text-plum hover:underline">
              {say(nav.invoices)} →
            </Link>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[13px]">
            <tbody className="divide-y divide-rule">
              {recent.map((invoice) => {
                const state = stateOf(invoice, TODAY);
                const late = daysOverdue(invoice, TODAY);
                const client = clients.find((entry) => entry.id === invoice.clientId);
                return (
                  <tr key={invoice.id}>
                    <td className="px-5 py-2.5 font-type text-xs text-ink-3">{invoice.serial}</td>
                    <td className="py-2.5 pr-4 font-medium text-ink">{client?.name}</td>
                    <td className="py-2.5 pr-4 text-ink-2">{say(invoice.description)}</td>
                    <td className="py-2.5 pr-4 text-right text-ink-3">
                      {day(invoice.issuedOn, language)}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-ink">
                      {money(receiptOf(invoice).tahsil, language)}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <Tag tone={STATE_TONE[state]}>
                        {say(STATE_LABEL[state])}
                        {state === "overdue" ? ` ${late}` : ""}
                      </Tag>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Sheet>
    </Page>
  );
}
