"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/kit/cn";
import { day } from "@/kit/display";
import type { Text } from "@/kit/i18n";
import { chrome, nav } from "@/words/ui";
import { TAX_YEAR, TODAY } from "@/records/workspace";
import { useLanguage } from "@/paper/parts/language";
import { LanguageSwitch } from "./language-switch";
import { Mark } from "./mark";

/**
 * The chrome is a masthead, not an app bar: name on the left, the period the
 * book covers on the right, a thick-over-thin rule beneath, and the sections
 * set as tabs against that rule. It is the top of a document rather than the
 * frame of a tool, which is the whole point of how this product should feel.
 */

const SECTIONS: { href: string; label: Text }[] = [
  { href: "/ledger", label: nav.ledger },
  { href: "/invoices", label: nav.invoices },
  { href: "/clients", label: nav.clients },
  { href: "/tax", label: nav.tax },
  { href: "/cashflow", label: nav.cashflow },
];

export function Masthead() {
  const pathname = usePathname();
  const { language, say } = useLanguage();

  return (
    <header className="bg-stock">
      <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
        <div className="flex items-end justify-between gap-6 pt-6 pb-3">
          <Link href="/" className="text-ink" aria-label={say(chrome.home)}>
            <Mark />
          </Link>
          <div className="flex items-center gap-4">
            <p className="hidden text-right text-[11px] leading-tight text-ink-3 sm:block">
              <span className="field block">{say(chrome.asOf)}</span>
              <span className="figures text-ink-2">{day(TODAY, language)}</span>
              <span className="text-ink-3"> · {say(chrome.taxYear)} {TAX_YEAR}</span>
            </p>
            <LanguageSwitch />
            <Link
              href="/"
              className="hidden text-[13px] text-ink-3 transition-colors hover:text-ink sm:block"
            >
              {say(chrome.signOut)}
            </Link>
          </div>
        </div>

        <nav className="rule-double thin-scroll -mb-px flex gap-6 overflow-x-auto">
          {SECTIONS.map((section) => {
            const active = pathname.startsWith(section.href);
            return (
              <Link
                key={section.href}
                href={section.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative -mb-[3px] shrink-0 border-b-[3px] pb-2 text-[13px] font-semibold transition-colors",
                  active
                    ? "border-plum text-plum"
                    : "border-transparent text-ink-3 hover:text-ink",
                )}
              >
                {say(section.label)}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function Page({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1180px] px-5 pt-8 pb-20 lg:px-8">
      <h1 className="font-serif text-[2.5rem] leading-none text-ink">{title}</h1>
      {lead ? (
        <p className="mt-3 max-w-[74ch] text-[13.5px] leading-relaxed text-ink-2">{lead}</p>
      ) : null}
      <div className="mt-7 space-y-7">{children}</div>
    </div>
  );
}
