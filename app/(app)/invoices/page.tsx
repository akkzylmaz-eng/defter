"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { cn } from "@/kit/cn";
import { day, days, money, moneyRound } from "@/kit/display";
import { STATE_LABEL, type InvoiceState } from "@/engine/invoices/types";
import { daysOverdue, receiptOf, stateOf } from "@/engine/invoices/ledger";
import { lateInterest } from "@/engine/invoices/interest";
import { invoices as words, receipt as receiptWords } from "@/words/ui";
import { clients } from "@/records/clients";
import { invoices } from "@/records/invoices";
import { TODAY, lateInterestRate } from "@/records/workspace";
import { Sheet, Tag, LeaderLine, Note, type Tone } from "@/paper/parts/marks";
import { Page } from "@/paper/frame/masthead";
import { useLanguage } from "@/paper/parts/language";

const STATE_TONE = {
  draft: "ink",
  outstanding: "ink",
  overdue: "debit",
  paid: "credit",
  "paid-late": "flag",
} as const satisfies Record<InvoiceState, Tone>;

const STATES: InvoiceState[] = ["outstanding", "overdue", "paid", "paid-late", "draft"];

export default function InvoicesPage() {
  const { language, say } = useLanguage();
  const [query, setQuery] = useState("");
  const [state, setState] = useState<InvoiceState | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(language);
    return [...invoices]
      .sort((a, b) => b.issuedOn.localeCompare(a.issuedOn))
      .filter((invoice) => {
        if (state !== "all" && stateOf(invoice, TODAY) !== state) return false;
        if (!needle) return true;
        const client = clients.find((entry) => entry.id === invoice.clientId);
        return [invoice.serial, client?.name ?? "", say(invoice.description)]
          .join(" ")
          .toLocaleLowerCase(language)
          .includes(needle);
      });
  }, [query, state, language, say]);

  const visibleTotal = rows
    .filter((invoice) => !invoice.draft)
    .reduce((total, invoice) => total + receiptOf(invoice).tahsil, 0);

  return (
    <Page title={say(words.title)} lead={say(words.lead)}>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex min-w-56 flex-1 items-center gap-2 border border-rule bg-sheet px-3 py-2">
          <Search className="size-4 shrink-0 text-ink-3" strokeWidth={2} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={say(words.searchPlaceholder)}
            className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-3 focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-1">
          <Chip active={state === "all"} onClick={() => setState("all")}>
            {say(words.all)}
          </Chip>
          {STATES.map((option) => (
            <Chip key={option} active={state === option} onClick={() => setState(option)}>
              {say(STATE_LABEL[option])}
            </Chip>
          ))}
        </div>
      </div>

      <Sheet>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-[13px]">
            <thead>
              <tr className="border-b border-ink text-left">
                <Th className="pl-5">{say(words.serial)}</Th>
                <Th>{say(words.client)}</Th>
                <Th>{say(words.work)}</Th>
                <Th align="right">{say(words.issued)}</Th>
                <Th align="right">{say(words.due)}</Th>
                <Th align="right">{say(words.gross)}</Th>
                <Th align="right">{say(words.collect)}</Th>
                <Th align="right" className="pr-5">
                  {say(words.state)}
                </Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-ink-3">
                    {say(words.empty)}
                  </td>
                </tr>
              ) : (
                rows.map((invoice) => {
                  const client = clients.find((entry) => entry.id === invoice.clientId);
                  const state = stateOf(invoice, TODAY);
                  const document = receiptOf(invoice);
                  const open = openId === invoice.id;
                  const interest = lateInterest(invoice, TODAY, lateInterestRate);

                  return (
                    <Fragment key={invoice.id}>
                      <tr
                        onClick={() => setOpenId(open ? null : invoice.id)}
                        className={cn(
                          "cursor-pointer transition-colors",
                          open ? "bg-tint" : "hover:bg-tint/60",
                        )}
                      >
                        <td className="py-2.5 pl-5 font-type text-xs text-ink-3">
                          <span className="inline-flex items-center gap-1">
                            <ChevronRight
                              className={cn("size-3 transition-transform", open && "rotate-90")}
                              strokeWidth={2.5}
                            />
                            {invoice.serial}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 font-medium text-ink">{client?.name}</td>
                        <td className="py-2.5 pr-4 text-ink-2">{say(invoice.description)}</td>
                        <td className="py-2.5 pr-4 text-right text-ink-3">
                          {day(invoice.issuedOn, language)}
                        </td>
                        <td className="py-2.5 pr-4 text-right text-ink-3">
                          {day(invoice.dueOn, language)}
                        </td>
                        <td className="py-2.5 pr-4 text-right text-ink-2">
                          {moneyRound(document.brut, language)}
                        </td>
                        <td className="py-2.5 pr-4 text-right font-medium text-ink">
                          {moneyRound(document.tahsil, language)}
                        </td>
                        <td className="py-2.5 pr-5 text-right">
                          <Tag tone={STATE_TONE[state]}>{say(STATE_LABEL[state])}</Tag>
                        </td>
                      </tr>

                      {open ? (
                        <tr className="bg-tint">
                          <td colSpan={8} className="px-5 pt-1 pb-5">
                            <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
                              <div className="border border-rule-2 bg-sheet px-4 py-3.5">
                                <p className="field mb-2.5 font-type">{invoice.serial}</p>
                                <div className="space-y-1.5">
                                  <LeaderLine
                                    label={say(receiptWords.brut)}
                                    value={money(document.brut, language)}
                                  />
                                  <LeaderLine
                                    label={say(receiptWords.stopaj)}
                                    value={`-${money(document.stopaj, language)}`}
                                  />
                                  <LeaderLine
                                    label={say(receiptWords.net)}
                                    value={money(document.net, language)}
                                  />
                                  <LeaderLine
                                    label={say(receiptWords.kdv)}
                                    value={`+${money(document.kdv, language)}`}
                                  />
                                  <div className="border-t border-ink pt-1.5">
                                    <LeaderLine
                                      strong
                                      label={say(receiptWords.tahsil)}
                                      value={money(document.tahsil, language)}
                                      tone="plum"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3">
                                {invoice.rates.kdv === 0 && invoice.rates.stopaj === 0 ? (
                                  <Note>{say(receiptWords.exported)}</Note>
                                ) : invoice.rates.stopaj === 0 ? (
                                  <Note>{say(receiptWords.noWithholding)}</Note>
                                ) : (
                                  <Note>{say(receiptWords.note)}</Note>
                                )}

                                {state === "overdue" || state === "paid-late" ? (
                                  <div className="border border-debit/25 bg-debit-soft px-3.5 py-2.5">
                                    <p className="text-[13px] text-debit">
                                      {days(daysOverdue(invoice, TODAY), language)}{" "}
                                      {say(words.lateBy)} · {money(interest.amount, language)}{" "}
                                      {say(words.interest)}
                                    </p>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-ink">
                <td colSpan={6} className="py-2.5 pl-5 text-right field">
                  {say(words.totals)}
                </td>
                <td className="py-2.5 pr-4 text-right font-semibold text-ink">
                  {money(visibleTotal, language)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </Sheet>
    </Page>
  );
}

function Th({
  children,
  align = "left",
  className,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <th
      className={cn(
        "field pb-2 font-semibold",
        align === "right" ? "pr-4 text-right" : "pr-4 text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "border px-2.5 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-ink bg-ink text-stock"
          : "border-rule bg-sheet text-ink-3 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
