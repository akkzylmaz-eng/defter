"use client";

import { day, days, money, moneyRound, moneyShort, month, monthShort } from "@/kit/display";
import { daysBetween } from "@/kit/dates";
import { receiptOf } from "@/engine/invoices/ledger";
import { expectedPayment, project, runwayMonths, shortfall } from "@/engine/cashflow/projection";
import { cashflow as words } from "@/words/ui";
import { book, instalments, open as openInvoices } from "@/records/book";
import { clients } from "@/records/clients";
import { invoices } from "@/records/invoices";
import { TODAY, monthlyExpenses, openingBalance } from "@/records/workspace";
import { Figure, FigureCell, FigureRow, Sheet, SheetHead, Tag } from "@/paper/parts/marks";
import { Page } from "@/paper/frame/masthead";
import { useLanguage } from "@/paper/parts/language";

const HORIZON = 6;

/**
 * Two projections are drawn on purpose: the one that learns each client's lag,
 * and the naive one that assumes invoices are paid on the day they fall due.
 * The gap between them is the point of the whole screen.
 */
const learned = project({
  from: TODAY,
  months: HORIZON,
  openingBalance,
  invoices,
  standings: book,
  instalments,
  monthlyExpenses,
});

const naive = project({
  from: TODAY,
  months: HORIZON,
  openingBalance,
  invoices,
  // No standings means no history, so every invoice falls on its due date.
  standings: [],
  instalments,
  monthlyExpenses,
});

export default function CashflowPage() {
  const { language, say } = useLanguage();
  const short = shortfall(learned);
  const runway = runwayMonths(openingBalance, monthlyExpenses);
  const peak = Math.max(...learned.map((cell) => Math.abs(cell.balance)), 1);

  const scheduleRows = openInvoices
    .map((invoice) => ({
      invoice,
      expected: expectedPayment(invoice, book, TODAY),
      amount: receiptOf(invoice).tahsil,
    }))
    .sort((a, b) => a.expected.localeCompare(b.expected));

  return (
    <Page title={say(words.title)} lead={say(words.lead)}>
      <FigureRow>
        <FigureCell>
          <Figure label={say(words.opening)} value={moneyRound(openingBalance, language)} />
        </FigureCell>
        <FigureCell>
          <Figure
            label={say(words.monthlyOut)}
            value={moneyRound(monthlyExpenses, language)}
            tone="debit"
          />
        </FigureCell>
        <FigureCell>
          <Figure
            label={say(words.runway)}
            value={`${runway.toLocaleString(language === "tr" ? "tr-TR" : "en-GB")} ${say(words.months)}`}
            tone="flag"
          />
        </FigureCell>
        <FigureCell>
          <Figure
            label={say(words.shortfallTitle)}
            value={short ? month(short.month, language) : "-"}
            note={short ? undefined : say(words.shortfallNone)}
            tone={short ? "debit" : "credit"}
          />
        </FigureCell>
      </FigureRow>

      <Sheet>
        <SheetHead
          title={say(words.projectionTitle)}
          aside={
            <div className="flex items-center gap-3 text-[11px] text-ink-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2 w-4 bg-plum" aria-hidden /> {say(words.balance)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-4 border border-dashed border-ink-3"
                  aria-hidden
                />
                {say(words.naiveLegend)}
              </span>
            </div>
          }
        />

        {/* A column chart drawn as flex boxes: two series, no axis, the figure
            printed under each column because there are only six of them. */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex h-44 items-end gap-3">
            {learned.map((cell, index) => {
              const naiveCell = naive[index];
              return (
                <div key={cell.month} className="flex flex-1 flex-col justify-end gap-1">
                  <div className="relative flex h-full items-end">
                    <div
                      className="w-full bg-plum"
                      style={{ height: `${(Math.max(cell.balance, 0) / peak) * 100}%` }}
                    />
                    <div
                      className="absolute inset-x-0 border-t-2 border-dashed border-ink-3"
                      style={{ bottom: `${(Math.max(naiveCell.balance, 0) / peak) * 100}%` }}
                      aria-hidden
                    />
                  </div>
                  <p className="figures text-center text-[11px] text-ink-2">
                    {moneyShort(cell.balance, language)}
                  </p>
                  <p className="text-center text-[11px] text-ink-3">
                    {monthShort(cell.month, language)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto border-t border-rule">
          <table className="w-full min-w-[680px] text-[13px]">
            <thead>
              <tr className="border-b border-rule text-left">
                <th className="field pb-2 pt-3 pl-5">{say(words.month)}</th>
                <th className="field pb-2 pt-3 pr-4 text-right">{say(words.collections)}</th>
                <th className="field pb-2 pt-3 pr-4 text-right">{say(words.expenses)}</th>
                <th className="field pb-2 pt-3 pr-4 text-right">{say(words.taxOut)}</th>
                <th className="field pb-2 pt-3 pr-4 text-right">{say(words.net)}</th>
                <th className="field pb-2 pt-3 pr-5 text-right">{say(words.balance)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {learned.map((cell) => (
                <tr key={cell.month}>
                  <td className="py-2.5 pl-5 text-ink">{month(cell.month, language)}</td>
                  <td className="py-2.5 pr-4 text-right text-credit">
                    {cell.collections === 0 ? "-" : money(cell.collections, language)}
                  </td>
                  <td className="py-2.5 pr-4 text-right text-ink-2">
                    -{money(cell.expenses, language)}
                  </td>
                  <td className="py-2.5 pr-4 text-right text-ink-2">
                    {cell.tax === 0 ? "-" : `-${money(cell.tax, language)}`}
                  </td>
                  <td
                    className={`py-2.5 pr-4 text-right font-medium ${cell.net < 0 ? "text-debit" : "text-ink"}`}
                  >
                    {money(cell.net, language)}
                  </td>
                  <td
                    className={`py-2.5 pr-5 text-right font-semibold ${cell.balance < 0 ? "text-debit" : "text-ink"}`}
                  >
                    {money(cell.balance, language)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sheet>

      <Sheet>
        <SheetHead title={say(words.scheduleTitle)} lead={say(words.scheduleLead)} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[13px]">
            <thead>
              <tr className="border-b border-ink text-left">
                <th className="field pb-2 pl-5">{say(words.month)}</th>
                <th className="field pb-2 pr-4">{say(words.collections)}</th>
                <th className="field pb-2 pr-4 text-right">{say(words.expected)}</th>
                <th className="field pb-2 pr-5 text-right">{say(words.balance)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {scheduleRows.map(({ invoice, expected, amount }) => {
                const lag = daysBetween(invoice.dueOn, expected);
                const client = clients.find((entry) => entry.id === invoice.clientId);
                return (
                  <tr key={invoice.id}>
                    <td className="py-2.5 pl-5 font-type text-xs text-ink-3">{invoice.serial}</td>
                    <td className="py-2.5 pr-4 text-ink">{client?.name}</td>
                    <td className="py-2.5 pr-4 text-right">
                      <span className="text-ink-3">{day(invoice.dueOn, language)}</span>
                      {lag !== 0 ? (
                        <>
                          <span className="mx-1.5 text-ink-3">→</span>
                          <span className="font-medium text-ink">{day(expected, language)}</span>
                          <Tag tone={lag > 0 ? "flag" : "credit"}>
                            {lag > 0 ? "+" : ""}
                            {days(lag, language)}
                          </Tag>
                        </>
                      ) : null}
                    </td>
                    <td className="py-2.5 pr-5 text-right font-medium text-ink">
                      {money(amount, language)}
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
