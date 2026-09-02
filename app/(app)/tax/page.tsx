"use client";

import { useState } from "react";
import { day, money, moneyRound, month, percent, rate } from "@/kit/display";
import { lira, roundHalfUp, type Kurus } from "@/kit/money";
import { SCHEDULE_2026, sliceByBand } from "@/engine/tax/brackets";
import { setAsideRate } from "@/engine/tax/annual";
import { ledger as ledgerWords, tax as words } from "@/words/ui";
import { instalments, totals, vat, vatFilings, yearToDate } from "@/records/book";
import { TAX_YEAR } from "@/records/workspace";
import { Bar, Figure, FigureCell, FigureRow, Note, Sheet, SheetHead, Tag } from "@/paper/parts/marks";
import { Page } from "@/paper/frame/masthead";
import { useLanguage } from "@/paper/parts/language";

/**
 * The tax screen exists to make the bands visible. The single number at the
 * top is the answer; the table underneath is why, and the flat-rate comparison
 * beside it is what the number would be if the calculation were done the way
 * most people assume it works.
 */
export default function TaxPage() {
  const { language, say } = useLanguage();
  const [base, setBase] = useState<Kurus>(yearToDate.base);

  const slices = sliceByBand(base);
  const total = slices.reduce((sum, slice) => sum + slice.tax, 0);
  const topRate = slices.length > 0 ? slices[slices.length - 1].band.rate : 0.15;
  const flat = roundHalfUp(base * topRate);
  const aside = setAsideRate(base, 0.2);

  return (
    <Page title={say(words.title)} lead={say(words.lead)}>
      <FigureRow>
        <FigureCell>
          <Figure label={say(ledgerWords.computed)} value={money(total, language)} tone="plum" />
        </FigureCell>
        <FigureCell>
          <Figure
            label={say(words.cumulativeBase)}
            value={moneyRound(base, language)}
          />
        </FigureCell>
        <FigureCell>
          <Figure
            label={say(words.setAsideTitle)}
            value={rate(aside, language)}
            note={`${money(lira(1000) * aside, language)} ${say(words.perLira)}`}
            tone={aside > 0 ? "flag" : "credit"}
          />
        </FigureCell>
        <FigureCell>
          <Figure
            label={say(words.advanceTitle)}
            value={moneyRound(
              instalments.reduce((sum, instalment) => sum + instalment.payable, 0),
              language,
            )}
            note={say(words.q4Note)}
          />
        </FigureCell>
      </FigureRow>

      <Sheet>
        <SheetHead
          title={say(words.bandsTitle)}
          lead={say(words.bandsLead)}
          aside={
            <label className="block text-right">
              <span className="field">{say(words.cumulativeBase)}</span>
              <input
                type="range"
                min={0}
                max={lira(6_000_000)}
                step={lira(10_000)}
                value={base}
                onChange={(event) => setBase(Number(event.target.value))}
                className="mt-1 block w-52 accent-[var(--color-plum)]"
              />
            </label>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-[13px]">
            <thead>
              <tr className="border-b border-ink text-left">
                <th className="field pb-2 pl-5">{say(words.band)}</th>
                <th className="field pb-2 pr-4 text-right">{say(words.bandRate)}</th>
                <th className="field pb-2 pr-4 text-right">{say(words.inBand)}</th>
                <th className="field pb-2 pr-4 text-right">{say(words.bandTax)}</th>
                <th className="pb-2 pr-5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {SCHEDULE_2026.bands.map((band, index) => {
                const slice = slices[index];
                const floor = index === 0 ? 0 : SCHEDULE_2026.bands[index - 1].upTo!;
                return (
                  <tr key={index} className={slice ? "" : "text-ink-3"}>
                    <td className="py-2.5 pl-5 text-ink-2">
                      {moneyRound(floor, language)}
                      {band.upTo === null ? " +" : ` - ${moneyRound(band.upTo, language)}`}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-medium text-ink">
                      {rate(band.rate, language)}
                    </td>
                    <td className="py-2.5 pr-4 text-right">
                      {slice ? money(slice.taxable, language) : "-"}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-medium">
                      {slice ? money(slice.tax, language) : "-"}
                    </td>
                    <td className="w-40 py-2.5 pr-5">
                      {slice ? (
                        <Bar value={(slice.tax / (total || 1)) * 100} tone="plum" />
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-ink">
                <td colSpan={3} className="field py-2.5 pl-5 pr-4 text-right">
                  {say(words.bandTax)}
                </td>
                <td className="py-2.5 pr-4 text-right font-semibold text-plum">
                  {money(total, language)}
                </td>
                <td className="pr-5" />
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="border-t border-rule px-5 py-4">
          <p className="flex flex-wrap items-baseline gap-2 text-[13px] text-ink-2">
            <span>{say(words.flatWarning)}</span>
            <span className="figures font-semibold text-debit line-through decoration-debit/50">
              {money(flat, language)}
            </span>
            <Tag tone="debit">
              +{money(flat - total, language)}
            </Tag>
          </p>
        </div>
      </Sheet>

      <Sheet>
        <SheetHead title={say(words.advanceTitle)} lead={say(words.advanceLead)} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[13px]">
            <thead>
              <tr className="border-b border-ink text-left">
                <th className="field pb-2 pl-5">{say(words.quarter)}</th>
                <th className="field pb-2 pr-4 text-right">{say(words.cumulativeBase)}</th>
                <th className="field pb-2 pr-4 text-right">{say(words.cumulativeTax)}</th>
                <th className="field pb-2 pr-4 text-right">{say(words.offset)}</th>
                <th className="field pb-2 pr-4 text-right">{say(words.payable)}</th>
                <th className="field pb-2 pr-5 text-right">{say(words.dueOn)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {instalments.map((instalment) => (
                <tr key={instalment.quarter}>
                  <td className="py-2.5 pl-5 font-medium text-ink">Q{instalment.quarter}</td>
                  <td className="py-2.5 pr-4 text-right text-ink-2">
                    {money(instalment.base, language)}
                  </td>
                  <td className="py-2.5 pr-4 text-right text-ink-2">
                    {money(instalment.cumulativeTax, language)}
                  </td>
                  <td className="py-2.5 pr-4 text-right text-ink-2">
                    -{money(instalment.credits, language)}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-semibold">
                    {instalment.payable > 0 ? (
                      <span className="text-ink">{money(instalment.payable, language)}</span>
                    ) : (
                      <span className="text-credit">
                        - <span className="font-normal text-ink-3">
                          ({say(words.carried)} {money(instalment.carried, language)})
                        </span>
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-5 text-right text-ink-3">
                    {day(instalment.dueOn, language)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 border-t border-rule px-5 py-4">
          <Note>{say(words.q4Note)}</Note>
          <Note>{say(words.covered)}</Note>
          <p className="flex items-baseline gap-2 text-[13px]">
            <span className="field">{say(words.stillOwed)}</span>
            <span className="figures font-semibold text-debit">
              {money(Math.max(0, yearToDate.balance), language)}
            </span>
          </p>
        </div>
      </Sheet>

      <Sheet>
        <SheetHead
          title={say(words.kdvTitle)}
          lead={say(words.kdvLead)}
          aside={
            <div className="text-right">
              <p className="field">{say(words.kdvPaid)}</p>
              <p className="figures text-lg font-semibold text-ink">
                {moneyRound(vat.paid, language)}
              </p>
            </div>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[13px]">
            <thead>
              <tr className="border-b border-ink text-left">
                <th className="field pb-2 pl-5">{say(words.kdvMonth)}</th>
                <th className="field pb-2 pr-4 text-right">{say(words.kdvCollected)}</th>
                <th className="field pb-2 pr-4 text-right">{say(words.kdvDeductible)}</th>
                <th className="field pb-2 pr-4 text-right">{say(words.kdvCarriedIn)}</th>
                <th className="field pb-2 pr-4 text-right">{say(words.payable)}</th>
                <th className="field pb-2 pr-5 text-right">{say(words.dueOn)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {vatFilings.map((filing) => (
                <tr key={filing.month}>
                  <td className="py-2.5 pl-5 font-medium text-ink">
                    {month(filing.month, language)}
                  </td>
                  <td className="py-2.5 pr-4 text-right text-ink-2">
                    {money(filing.collected, language)}
                  </td>
                  <td className="py-2.5 pr-4 text-right text-ink-2">
                    -{money(filing.deductible, language)}
                  </td>
                  <td className="py-2.5 pr-4 text-right text-ink-3">
                    {filing.carriedIn > 0 ? `-${money(filing.carriedIn, language)}` : "–"}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-semibold">
                    {filing.payable > 0 ? (
                      <span className="text-ink">{money(filing.payable, language)}</span>
                    ) : (
                      <span className="text-credit">
                        - <span className="font-normal text-ink-3">
                          ({say(words.carried)} {money(filing.carriedOut, language)})
                        </span>
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-5 text-right text-ink-3">
                    {day(filing.dueOn, language)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 border-t border-rule px-5 py-4">
          <Note>{say(words.kdvNote)}</Note>
          <Note>{say(words.kdvDueNote)}</Note>
          {vat.carried > 0 ? (
            <p className="flex items-baseline gap-2 text-[13px]">
              <span className="field">{say(words.kdvOnAccount)}</span>
              <span className="figures font-semibold text-credit">
                {money(vat.carried, language)}
              </span>
            </p>
          ) : null}
        </div>
      </Sheet>

      <Sheet className="p-5">
        <h2 className="font-serif text-xl text-ink">{say(words.setAsideTitle)}</h2>
        <p className="mt-1.5 max-w-[70ch] text-[13px] leading-relaxed text-ink-2">
          {say(words.setAsideLead)}
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-8">
          <Figure
            label={`${TAX_YEAR} · ${say(words.setAsideTitle)}`}
            value={rate(aside, language)}
            tone={aside > 0 ? "flag" : "credit"}
            size="lg"
          />
          <Figure
            label={say(words.bandRate)}
            value={rate(yearToDate.marginalRate, language)}
          />
          <Figure
            label={say(words.offset)}
            value={money(totals.stopaj, language)}
            tone="plum"
          />
          <Figure
            label={say(ledgerWords.effective)}
            value={percent(yearToDate.effectiveRate, language)}
          />
        </div>
      </Sheet>
    </Page>
  );
}
